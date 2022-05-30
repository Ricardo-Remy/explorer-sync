import { Injectable, Inject, Logger, CACHE_MANAGER } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { Cache } from 'cache-manager';
import {
  LumNetworkConnection,
  sortArrayHelper,
  BlockSyncConstants,
} from '@app/common';
import { LumUtils } from '@lum-network/sdk-javascript';

import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment';

@Injectable()
export class BlockSyncService {
  private readonly logger: Logger = new Logger(BlockSyncService.name);

  constructor(
    @Inject(BlockSyncConstants.EXPLORER) private explorerClient: ClientProxy,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly lumNetworkConnection: LumNetworkConnection,
  ) {}

  // fetchBlocksProcessor will call lum-client every 30 seconds to fetch blocks
  @Cron(CronExpression.EVERY_30_SECONDS)
  async fetchBlocksProcessor() {
    try {
      // connect to lum client
      const getLumClient = await this.lumNetworkConnection.getLumClient();

      // Get the last 20 blocks from test rpc
      const lastBlocks = await getLumClient.tmClient.blockchain();
      this.logger.debug('Successfully fetched the last 20 blocks');

      // Get block height of received blocks
      const getBlockHeight = lastBlocks.blockMetas.map(
        (block) => block.header.height,
      );

      // Get cached block or default to getBlockHeight for first iteration
      const getCachedBlockHeight =
        (await this.cacheManager.get('cached_block')) || getBlockHeight;

      // We want to avoid to send the same blocks to explorer service, so we filter out here
      // Find the newly added blockHeight
      const filteredBlockHeight = getBlockHeight.filter(
        // This below ts-ignore is to avoid touching ts-config for the purpose of this exercice
        // @ts-ignore
        (el) => !getCachedBlockHeight.includes(el),
      );

      // Avoid to send duplicate events to explorer service
      const getUniqueBlockHeight = !filteredBlockHeight.length
        ? getCachedBlockHeight
        : filteredBlockHeight;

      // We sort in order to generate sequential event stream and later on insert properly into DB
      const sortedBlockHeight = sortArrayHelper(
        getUniqueBlockHeight as Array<number> | any,
      );

      this.logger.log('sortBlockHeight', sortedBlockHeight);

      // Loop through sorted sortedBlockHeight
      for (const height of sortedBlockHeight) {
        const blockData = await getLumClient.getBlock(height);
        // Emit event block_fetched
        await lastValueFrom(
          this.explorerClient.emit('block_fetched', {
            blockHeight: blockData.block.header.height,
            blockTx: blockData.block.txs.length,
            txHashes: blockData.block.txs.map((tx) =>
              LumUtils.toHex(LumUtils.sha256(tx)).toUpperCase(),
            ),
            timestamp: moment(
              blockData.block.header.time as Date,
            ).toISOString(),
          }),
        );
        await this.cacheManager.set('cached_block', getBlockHeight);
      }
    } catch (error) {
      this.logger.error(`Failed to failed the last 20 blocks`, error);
    }
  }
}
