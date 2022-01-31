import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { createLightship } from 'lightship';

async function bootstrap() {
  require('axios-debug-log/enable');
  const lightship = createLightship();
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
    logger: ['verbose'],
  });
  lightship.registerShutdownHandler(() => app.close());
  app.use(morgan('dev'));
  app.useGlobalPipes(new ValidationPipe());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  await app.listen(3000);
  lightship.signalReady();
}
bootstrap();
