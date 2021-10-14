import { DynamicModule, HttpModule, Module } from '@nestjs/common';
import { CcpAsyncOptions } from './interfaces';
import { SdkConfig } from '@ccp/sdk';
import { CcpCoreModule } from './CcpCoreModule';

@Module({})
export class CcpModule {
  public static forRoot(options: SdkConfig): DynamicModule {
    return {
      module: CcpModule,
      imports: [HttpModule, CcpCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(options: CcpAsyncOptions): DynamicModule {
    return {
      module: CcpModule,
      imports: [CcpCoreModule.forRootAsync(options)],
    };
  }
}
