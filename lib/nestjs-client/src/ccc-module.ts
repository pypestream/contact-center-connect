import { DynamicModule, HttpModule, Module } from '@nestjs/common';
import { CccAsyncOptions } from './interfaces';
import { SdkConfig } from './types';
import { CccCoreModule } from './CccCoreModule';
import { ServiceNowController } from './contact-centers/service-now/service-now.controller';
import { MiddlewareApiController } from './contact-centers/middleware-api/middleware-api.controller';

@Module({})
export class CccModule {
  public static forRoot(options: SdkConfig): DynamicModule {
    return {
      module: CccModule,
      controllers: [ServiceNowController, MiddlewareApiController],
      imports: [HttpModule, CccCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(options?: CccAsyncOptions): DynamicModule {
    return {
      module: CccModule,
      controllers: [ServiceNowController, MiddlewareApiController],
      imports: [CccCoreModule.forRootAsync(options)],
    };
  }
}
