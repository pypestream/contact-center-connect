import { DynamicModule, HttpModule, Module } from '@nestjs/common';
import { CccAsyncOptions } from './src/common/interfaces';
import { SdkConfig } from './src/common/types';
import { CccCoreModule } from './ccc-core-module';
import { ServiceNowModule } from './src/service-now/service-now.module';
import { MiddlewareApiModule } from './src/middleware-api/middleware-api.module';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

@Module({})
export class CccModule {
  public static forRoot(options: SdkConfig): DynamicModule {
    return {
      module: CccModule,
      controllers: [],
      imports: [
        HttpModule,
        CccCoreModule.forRoot(options),
        MiddlewareApiModule,
        ServiceNowModule,
      ],
      providers: [
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    };
  }

  public static forRootAsync(options?: CccAsyncOptions): DynamicModule {
    return {
      module: CccModule,
      imports: [
        CccCoreModule.forRootAsync(options),
        MiddlewareApiModule,
        ServiceNowModule,
      ],
      providers: [
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    };
  }
}
