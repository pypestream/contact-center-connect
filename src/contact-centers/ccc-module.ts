import { DynamicModule, Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { MiddlewareApiModule } from './src/middleware-api/middleware-api.module';
import { GenesysModule } from './src/genesys/genesys.module';
import { FlexModule } from './src/flex/flex.module';
import { ServiceNowModule } from './src/service-now/service-now.module';
import { MiddlewareApiConfig } from './src/middleware-api/types';
import { MiddlewareApiAsyncOptions } from './src/middleware-api/interfaces';

@Module({})
export class CccModule {
  public static forRoot(options: MiddlewareApiConfig): DynamicModule {
    return {
      module: CccModule,
      controllers: [],
      imports: [
        MiddlewareApiModule.forRoot(options),
        GenesysModule,
        FlexModule,
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

  public static forRootAsync(
    options?: MiddlewareApiAsyncOptions,
  ): DynamicModule {
    return {
      module: CccModule,
      controllers: [],
      imports: [
        MiddlewareApiModule.forRootAsync(options),
        MiddlewareApiModule,
        GenesysModule,
        FlexModule,
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
