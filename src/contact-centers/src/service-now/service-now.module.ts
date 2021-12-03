import { ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ServiceNowController } from './service-now.controller';
import { BodyMiddleware } from '../common/middlewares/body-middleware';
import { MiddlewareConsumer } from '@nestjs/common';

@Module({
  imports: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  controllers: [ServiceNowController],
  exports: [],
})
export class ServiceNowModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BodyMiddleware).forRoutes(ServiceNowController);
  }
}
