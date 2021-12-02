import { DynamicModule, HttpModule, Module } from '@nestjs/common';
import { CccAsyncOptions } from './src/common/interfaces';
import { SdkConfig } from './src/common/types';
import { CccCoreModule } from './ccc-core-module';
import { ServiceNowController } from './src/service-now/service-now.controller';
import { GenesysController } from './src/genesys/genesys.controller';
import { MiddlewareApiController } from './src/middleware-api/middleware-api.controller';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MiddlewareApiModule } from './src/middleware-api/middleware-api.module';
import { GenesysModule } from './src/genesys/genesys.module';
import { ServiceNowModule } from './src/service-now/service-now.module';

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
        GenesysModule,
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
      controllers: [
        ServiceNowController,
        GenesysController,
        MiddlewareApiController,
      ],
      imports: [CccCoreModule.forRootAsync(options)],
      providers: [
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    };
  }
}
