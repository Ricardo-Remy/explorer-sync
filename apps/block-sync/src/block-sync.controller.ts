import { Controller, Get } from '@nestjs/common';
import { BlockSyncService } from './block-sync.service';

@Controller()
export class BlockSyncController {
  constructor(private readonly blockSyncService: BlockSyncService) {}

  // This controller is of no need - We keep it to demo a controller test
  @Get()
  async fetchBlocksProcessor() {
    return this.blockSyncService.fetchBlocksProcessor();
  }
}
