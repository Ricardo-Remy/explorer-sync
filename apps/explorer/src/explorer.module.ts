import { CacheModule, Module } from '@nestjs/common';
import { ExplorerController } from './explorer.controller';
import { ExplorerService } from './explorer.service';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { ApiKeyGuard, DatabaseModule, RmqModule } from '@app/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Explorer, ExplorerSchema } from './schemas/explorer.schema';
import { ExplorerRepository } from './explorer.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        MONGODB_URI: Joi.string().required(),
        PORT: Joi.number().required(),
        RABBIT_MQ_URI: Joi.string().required(),
        RABBIT_MQ_EXPLORER_QUEUE: Joi.string().required(),
      }),

      envFilePath: './apps/explorer/.env',
    }),
    RmqModule,
    DatabaseModule,
    MongooseModule.forFeature([
      { name: Explorer.name, schema: ExplorerSchema },
    ]),
    ScheduleModule.forRoot(),
    CacheModule.register({
      ttl: 60,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 20,
    }),
  ],
  controllers: [ExplorerController],
  providers: [
    ExplorerService,
    ExplorerRepository,
    { provide: APP_GUARD, useClass: ApiKeyGuard },
  ],
})
export class ExplorerModule {}
