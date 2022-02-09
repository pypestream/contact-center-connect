import { Module } from '@nestjs/common';
import { GenesysController } from './genesys.controller';
import { GenesysService } from './genesys.service';
import { GenesysWebsocket } from './genesys.websocket';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { forwardRef } from '@nestjs/common';
import { HttpModule } from '../common/interceptors/http.module';

@Module({
  imports: [forwardRef(() => MiddlewareApiModule), HttpModule],
  providers: [GenesysWebsocket, GenesysService],
  controllers: [GenesysController],
  exports: [GenesysService],
})
export class GenesysModule {}
