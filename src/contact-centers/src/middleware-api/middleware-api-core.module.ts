import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { MiddlewareApiModuleOptions, MiddlewareApiToken } from './constants';
import {
  MiddlewareApiAsyncOptions,
  MiddlewareApiOptionsFactory,
} from './interfaces';
import { createMiddlewareApiProvider } from './providers';
import { getMiddlewareApiClient } from './util';
import { MiddlewareApiConfig } from './types';

@Global()
@Module({})
export class MiddlewareApiCoreModule {
  public static forRoot(options: MiddlewareApiConfig): DynamicModule {
    const provider = createMiddlewareApiProvider(options);

    return {
      exports: [provider],
      module: MiddlewareApiCoreModule,
      providers: [provider],
    };
  }

  static forRootAsync(options?: MiddlewareApiAsyncOptions): DynamicModule {
    const cccProvider: Provider = {
      inject: [MiddlewareApiModuleOptions],
      provide: MiddlewareApiToken,
      useFactory: (cccOptions: MiddlewareApiConfig) =>
        getMiddlewareApiClient(cccOptions),
    };

    return {
      exports: [cccProvider],
      imports: options.imports,
      module: MiddlewareApiCoreModule,
      providers: [...this.createAsyncProviders(options), cccProvider],
    };
  }

  private static createAsyncProviders(
    options: MiddlewareApiAsyncOptions,
  ): Provider[] {
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
    options: MiddlewareApiAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        inject: options.inject || [],
        provide: MiddlewareApiModuleOptions,
        useFactory: options.useFactory,
      };
    }

    return {
      inject: [options.useExisting || options.useClass],
      provide: MiddlewareApiModuleOptions,
      useFactory: (optionsFactory: MiddlewareApiOptionsFactory) =>
        optionsFactory.createMiddlewareApiOptions(),
    };
  }
}
