import { DynamicModule, HttpModule, Module } from '@nestjs/common';
import { CcpAsyncOptions } from './interfaces';
import { SdkConfig } from '@ccp/sdk';
import { CcpCoreModule } from './CcpCoreModule';
import { ServiceNowController } from './contact-centers/service-now/service-now.controller';
import { MiddlewareApiController } from './contact-centers/middleware-api/middleware-api.controller';

@Module({})
export class CcpModule {
  public static forRoot(options: SdkConfig): DynamicModule {
    return {
      module: CcpModule,
      controllers: [ServiceNowController, MiddlewareApiController],
      imports: [HttpModule, CcpCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(options?: CcpAsyncOptions): DynamicModule {
    return {
      module: CcpModule,
      controllers: [ServiceNowController, MiddlewareApiController],
      imports: [CcpCoreModule.forRootAsync(options)],
    };
  }
}
