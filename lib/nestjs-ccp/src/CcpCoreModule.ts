import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { CcpModuleOptions, ccpToken } from './constants';
import {
  CcpAsyncOptions,
  CcpOptionsFactory,
} from './interfaces';
import {CcpConfig} from '@ccp/sdk'
import { createCcpProvider } from './providers';
import { getCcpClient } from './util';

@Global()
@Module({})
export class CcpCoreModule {
  public static forRoot(options: CcpConfig): DynamicModule {
    const provider = createCcpProvider(options);

    return {
      exports: [provider],
      module: CcpCoreModule,
      providers: [provider],
    };
  }

  static forRootAsync(options: CcpAsyncOptions): DynamicModule {
    const ccpProvider: Provider = {
      inject: [CcpModuleOptions],
      provide: ccpToken,
      useFactory: (ccpOptions: CcpConfig) =>
        getCcpClient(ccpOptions),
    };

    return {
      exports: [ccpProvider],
      imports: options.imports,
      module: CcpCoreModule,
      providers: [...this.createAsyncProviders(options), ccpProvider],
    };
  }

  private static createAsyncProviders(options: CcpAsyncOptions): Provider[] {
    if (options.useExisting || options.useFactory) {
      return [this.createAsyncOptionsProvider(options)];
    }

    return [
      this.createAsyncOptionsProvider(options),
      {
        provide: options.useClass,
        useClass: options.useClass,
      },
    ];
  }

  private static createAsyncOptionsProvider(
    options: CcpAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        inject: options.inject || [],
        provide: CcpModuleOptions,
        useFactory: options.useFactory,
      };
    }

    return {
      inject: [options.useExisting || options.useClass],
      provide: CcpModuleOptions,
      useFactory: (optionsFactory: CcpOptionsFactory) =>
        optionsFactory.createCcpOptions(),
    };
  }
}
