import { ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { GenesysController } from './genesys.controller';
import { GenesysService } from './genesys.service';
import { GenesysWebsocket } from './genesys.websocket';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [forwardRef(() => MiddlewareApiModule), HttpModule],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    GenesysWebsocket,
    GenesysService,
  ],
  controllers: [GenesysController],
  exports: [GenesysService],
})
export class GenesysModule {}
