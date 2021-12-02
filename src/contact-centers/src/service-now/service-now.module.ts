import { ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ServiceNowController } from './service-now.controller';

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
export class ServiceNowModule {}
