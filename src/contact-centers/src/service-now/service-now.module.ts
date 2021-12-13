import { ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ServiceNowController } from './service-now.controller';
import { ServiceNowService } from './service-now.service';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [forwardRef(() => MiddlewareApiModule), HttpModule],
  providers: [ServiceNowService],
  controllers: [ServiceNowController],
  exports: [ServiceNowService],
})
export class ServiceNowModule {}
