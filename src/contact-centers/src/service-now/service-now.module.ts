import { Module } from '@nestjs/common';
import { ServiceNowService } from './service-now.service';
import { ServiceNowController } from './service-now.controller';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [forwardRef(() => MiddlewareApiModule)],
  providers: [ServiceNowService],
  controllers: [ServiceNowController],
  exports: [ServiceNowService],
})
export class ServiceNowModule {}
