import {
  RmqService,
  BlockSyncConstants,
  RequestResponseInterceptor,
  TimeoutInterceptor,
  HttpExceptionFilter,
} from '@app/common';
import { NestFactory } from '@nestjs/core';
import { ExplorerModule } from './explorer.module';
import { ConfigService } from '@nestjs/config';
import { VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(ExplorerModule);
  const configService = app.get(ConfigService);
  const rmqService = app.get<RmqService>(RmqService);
  // Enable api versioning
  app.enableVersioning({
    type: VersioningType.URI,
  });
  // Enable Filters
  app.useGlobalFilters(new HttpExceptionFilter());
  // Enable Interceptors
  app.useGlobalInterceptors(
    new RequestResponseInterceptor(),
    new TimeoutInterceptor(),
  );
  // Protect agains known http security threads (Strict-Transport-Security / Content-Security-Policy etc...)
  app.use(helmet());
  // CORS
  app.enableCors();
  // Swagger setup
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('Explorers Api')
    .setDescription(
      'Exposes two controllers that allows to get the last 100 blocks and delete all blocks',
    )
    .setVersion('1.0')
    .addTag('explorers')
    .build();
  // Create Swagger document
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // Connect microservices
  app.connectMicroservice(rmqService.getOptions(BlockSyncConstants.EXPLORER));
  // Start all microservices
  await app.startAllMicroservices();
  // Needed to listen to different port than block-sync
  await app.listen(configService.get('PORT'));
}
bootstrap();
