import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { BlockSyncController } from './block-sync.controller';
import { BlockSyncService } from './block-sync.service';
import * as Joi from 'joi';
import {
  BlockSyncConstants,
  LumNetworkConnection,
  RmqModule,
} from '@app/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CacheModule } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

describe('BlockSyncController', () => {
  let blockSyncController: BlockSyncController;
  let app: TestingModule;

  beforeEach(async () => {
    app = await Test.createTestingModule({
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
    }).compile();

    blockSyncController = app.get<BlockSyncController>(BlockSyncController);
  });

  describe('BlockSyncController', () => {
    it('should be defined"', () => {
      expect(blockSyncController.fetchBlocksProcessor()).toBeDefined();
    });
  });
  afterAll((done) => {
    app.close();
    done();
  });
});
