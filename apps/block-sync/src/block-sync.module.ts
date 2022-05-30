import {
  Module,
  OnModuleInit,
  OnApplicationBootstrap,
  Logger,
  CacheModule,
} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { BlockSyncController } from './block-sync.controller';
import { BlockSyncService } from './block-sync.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import {
  BlockSyncConstants,
  LumNetworkConnection,
  RmqModule,
} from '@app/common';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
      }),
      envFilePath: './apps/block-sync/.env',
    }),
    RmqModule.register({
      name: BlockSyncConstants.EXPLORER,
    }),
    ScheduleModule.forRoot(),
    CacheModule.register({
      ttl: 60,
    }),
    HttpModule,
  ],
  controllers: [BlockSyncController],
  providers: [BlockSyncService, LumNetworkConnection],
})
export class BlockSyncModule implements OnModuleInit, OnApplicationBootstrap {
  private readonly logger: Logger = new Logger(BlockSyncModule.name);

  constructor(private readonly lumNetworkConnection: LumNetworkConnection) {}
  async onModuleInit() {
    try {
      await this.lumNetworkConnection.initializeClient();
      this.logger.log('LumNetworkConnection - OnModuleInit - Initialized');
    } catch (error) {
      this.logger.error(
        'Error on LumNetworkConnection - BlockSyncModule - OnModuleInit',
      );
    }
  }

  async onApplicationBootstrap() {
    if (!this.lumNetworkConnection.isInitializedClient) {
      throw new Error('Cannot initialize the Lum Network Service');
    }
  }
}
