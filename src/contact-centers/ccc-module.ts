import { DynamicModule, HttpModule, Module } from '@nestjs/common';
import { CccAsyncOptions } from './src/common/interfaces';
import { SdkConfig } from './src/common/types';
import { CccCoreModule } from './ccc-core-module';
import { ServiceNowController } from './src/service-now/service-now.controller';
import { MiddlewareApiController } from './src/middleware-api/middleware-api.controller';

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
