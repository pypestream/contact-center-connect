import { ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { LivePersonController } from './liveperson.controller';
import { LivePersonService } from './liveperson.service';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FeatureFlagModule } from '../feature-flag/feature-flag.module';

@Module({
  imports: [
    forwardRef(() => MiddlewareApiModule),
    HttpModule,
    FeatureFlagModule,
  ],
  providers: [LivePersonService],
  controllers: [LivePersonController],
  exports: [LivePersonService],
})
export class LivePersonModule {}
