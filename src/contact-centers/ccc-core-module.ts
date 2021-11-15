import { DynamicModule, Global, Module, Provider } from '@nestjs/common';
import { CccModuleOptions, cccToken } from './src/common/constants';
import { CccAsyncOptions, CccOptionsFactory } from './src/common/interfaces';
import { SdkConfig } from './src/common/types';
import { createCccProvider } from './src/common/providers';
import { getCccClient } from './src/common/util';
import { MiddlewareConsumer } from '@nestjs/common';
import { BodyMiddleware } from './src/common/middlewares/body-middleware';

@Global()
@Module({})
export class CccCoreModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BodyMiddleware).forRoutes('*');
  }
  public static forRoot(options: SdkConfig): DynamicModule {
    const provider = createCccProvider(options);

    return {
      exports: [provider],
      module: CccCoreModule,
      providers: [provider],
    };
  }

  static forRootAsync(options?: CccAsyncOptions): DynamicModule {
    const cccProvider: Provider = {
      inject: [CccModuleOptions],
      provide: cccToken,
      useFactory: (cccOptions: SdkConfig) => getCccClient(cccOptions),
    };

    return {
      exports: [cccProvider],
      imports: options.imports,
      module: CccCoreModule,
      providers: [...this.createAsyncProviders(options), cccProvider],
    };
  }

  private static createAsyncProviders(options: CccAsyncOptions): Provider[] {
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
    options: CccAsyncOptions,
  ): Provider {
    if (options.useFactory) {
      return {
        inject: options.inject || [],
        provide: CccModuleOptions,
        useFactory: options.useFactory,
      };
    }

    return {
      inject: [options.useExisting || options.useClass],
      provide: CccModuleOptions,
      useFactory: (optionsFactory: CccOptionsFactory) =>
        optionsFactory.createCccOptions(),
    };
  }
}
