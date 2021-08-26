import {DynamicModule, HttpModule, Module} from '@nestjs/common';
import { CspAsyncOptions } from './interfaces';
import { CspConfig } from '@csp/sdk';
import { CspCoreModule } from './CspCoreModule';

@Module({})
export class CspModule {
  public static forRoot(options: CspConfig): DynamicModule {
    return {
      module: CspModule,
      imports: [HttpModule, CspCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(options: CspAsyncOptions): DynamicModule {
    return {
      module: CspModule,
      imports: [CspCoreModule.forRootAsync(options)],
    };
  }
}
