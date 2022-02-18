import { Module } from '@nestjs/common';
import { AmazonConnectController } from './amazon-connect.controller';
import { AmazonConnectService } from './amazon-connect.service';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { forwardRef } from '@nestjs/common';
import { HttpModule } from '../common/interceptors/http.module';

@Module({
  imports: [forwardRef(() => MiddlewareApiModule), HttpModule],
  providers: [AmazonConnectService],
  controllers: [AmazonConnectController],
  exports: [AmazonConnectService],
})
export class AmazonConnectModule {}
