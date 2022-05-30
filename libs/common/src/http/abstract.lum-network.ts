import { Injectable, Logger } from '@nestjs/common';
import { LumClient } from '@lum-network/sdk-javascript';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LumNetworkConnection {
  private client: LumClient = null;
  private readonly logger: Logger = new Logger(LumNetworkConnection.name);

  constructor(private readonly configService: ConfigService) {}

  async initializeClient() {
    try {
      this.client = await LumClient.connect(
        this.configService.get<string>('LUM_RPC_ENDPOINT'),
      );
      this.logger.log(
        `Initialize connect to lum-network ${this.configService.get<string>(
          'LUM_RPC_ENDPOINT',
        )}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed initialization to lum-network ${this.configService.get<string>(
          'LUM_RPC_ENDPOINT',
        )}`,
        error,
      );
    }
  }

  async getLumClient(): Promise<LumClient> {
    if (!this.client) {
      await this.initializeClient();
    }
    return this.client;
  }

  isInitializedClient(): boolean {
    return this.client !== null;
  }
}
