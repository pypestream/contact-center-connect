import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from 'morgan';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: ['verbose'],
  });
  app.use(morgan('dev'));
  await app.listen(3000);
}
bootstrap();