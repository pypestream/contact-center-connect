import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { CspModuleOptions, cspToken } from './constants';
import {
  CspAsyncOptions,
  CspOptionsFactory,
} from './interfaces';
import {CspConfig} from '@csp/sdk'
import { createCspProvider } from './providers';
import { getCspClient } from './util';

@Global()
@Module({})
export class CspCoreModule {
  public static forRoot(options: CspConfig): DynamicModule {
    const provider = createCspProvider(options);

    return {
      exports: [provider],
      module: CspCoreModule,
      providers: [provider],
    };
  }

  static forRootAsync(options: CspAsyncOptions): DynamicModule {
    const cspProvider: Provider = {
      inject: [CspModuleOptions],
      provide: cspToken,
      useFactory: (cspOptions: CspConfig) =>
        getCspClient(cspOptions),
    };

    return {
      exports: [cspProvider],
      imports: options.imports,
      module: CspCoreModule,
      providers: [...this.createAsyncProviders(options), cspProvider],
    };
  }

  private static createAsyncProviders(options: CspAsyncOptions): Provider[] {
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
    options: CspAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        inject: options.inject || [],
        provide: CspModuleOptions,
        useFactory: options.useFactory,
      };
    }

    return {
      inject: [options.useExisting || options.useClass],
      provide: CspModuleOptions,
      useFactory: (optionsFactory: CspOptionsFactory) =>
        optionsFactory.createCspOptions(),
    };
  }
}
