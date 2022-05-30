import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { BlockSyncModule } from './block-sync.module';
import { ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from '@app/common/filters/http-exception.filter';
import { RequestResponseInterceptor, TimeoutInterceptor } from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(BlockSyncModule);
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new RequestResponseInterceptor(),
    new TimeoutInterceptor(),
  );
  const configService = app.get(ConfigService);
  await app.listen(configService.get('PORT'));
}
bootstrap();
