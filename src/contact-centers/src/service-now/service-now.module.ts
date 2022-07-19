import { Module } from '@nestjs/common';
import { ServiceNowController } from './service-now.controller';
import { ServiceNowService } from './service-now.service';
import { MiddlewareApiModule } from '../middleware-api/middleware-api.module';
import { forwardRef } from '@nestjs/common';
import { HttpModule } from '../common/interceptors/http.module';
import { FeatureFlagModule } from '../feature-flag/feature-flag.module';

@Module({
  imports: [
    forwardRef(() => MiddlewareApiModule),
    HttpModule,
    FeatureFlagModule,
  ],
  providers: [ServiceNowService],
  controllers: [ServiceNowController],
  exports: [ServiceNowService],
})
export class ServiceNowModule {}
