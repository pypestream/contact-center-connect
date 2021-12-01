import { Module } from '@nestjs/common';
import { MiddlewareApiService } from './middleware-api.service';
import { MiddlewareApiController } from './middleware-api.controller';
import { HomepageController } from './homepage.controller';
import { ServiceNowModule } from '../service-now/service-now.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [forwardRef(() => ServiceNowModule)],
  providers: [MiddlewareApiService],
  controllers: [MiddlewareApiController, HomepageController],
  exports: [MiddlewareApiService],
})
export class MiddlewareApiModule {}
