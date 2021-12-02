import { ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { MiddlewareApiController } from './middleware-api.controller';
import { MiddlewareUiController } from './middleware-ui.controller';

@Module({
  imports: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  controllers: [MiddlewareApiController, MiddlewareUiController],
  exports: [],
})
export class MiddlewareApiModule {}
