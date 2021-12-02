import { ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { GenesysController } from './genesys.controller';
import { GenesysWebsocket } from './genesys.websocket';
import { BodyMiddleware } from '../common/middlewares/body-middleware';
import { MiddlewareConsumer } from '@nestjs/common';

@Module({
  imports: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    GenesysWebsocket,
  ],
  controllers: [GenesysController],
  exports: [],
})
export class GenesysModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BodyMiddleware).forRoutes('*');
  }
}
