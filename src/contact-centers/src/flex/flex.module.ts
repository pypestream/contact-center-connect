import { ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { FlexController } from './flex.controller';
import { FlexService } from './flex.service';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [forwardRef(() => MiddlewareApiModule), HttpModule],
  providers: [FlexService],
  controllers: [FlexController],
  exports: [FlexService],
})
export class FlexModule {}
