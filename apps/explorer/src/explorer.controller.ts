import {
  CustomCacheInterceptor,
  NoCache,
  PaginationQueryDto,
  RmqService,
} from '@app/common';
import {
  Controller,
  Get,
  Body,
  Delete,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ExplorerService } from './explorer.service';
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';
import { SkipThrottle } from '@nestjs/throttler';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ExplorerInsertBlockDto } from './dto/explorer-insert-block.event';

@ApiBearerAuth()
@SkipThrottle()
@UseInterceptors(CustomCacheInterceptor)
@Controller({ path: 'explorers', version: '1' })
export class ExplorerController {
  constructor(
    private readonly explorerService: ExplorerService,
    private readonly rmqService: RmqService,
  ) {}

  // Rate limiting is applied to get endpoint
  // Cached for 60seconds

  @SkipThrottle(false)
  @Get('blocks')
  // Limit paginationQuery
  getBlocks(@Query() paginationQuery: PaginationQueryDto) {
    return this.explorerService.getBlocks(paginationQuery);
  }

  // No rate limiting on this controller
  @SkipThrottle()
  // Not cached
  @NoCache()
  @Delete()
  deleteAllBlock() {
    return this.explorerService.deleteAllBlock();
  }

  // No rate limiting on this controller
  @SkipThrottle()
  // Not cached
  @NoCache()
  @EventPattern('block_fetched')
  async insertBlock(
    @Payload() @Body() block: ExplorerInsertBlockDto,
    @Ctx() context: RmqContext,
  ) {
    const { blockHeight, blockTx, txHashes, timestamp } = block;
    await this.explorerService.insertBlock({
      blockHeight,
      blockTx,
      txHashes,
      timestamp,
    });
    // acknowledge the context request from rb-mq
    this.rmqService.ack(context);
  }
}
