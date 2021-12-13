import { DynamicModule, ValidationPipe } from '@nestjs/common';
import { Module, forwardRef } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { MiddlewareApiController } from './middleware-api.controller';
import { MiddlewareUiController } from './middleware-ui.controller';
import { MiddlewareApiCoreModule } from './middleware-api-core.module';
import { MiddlewareApiService } from './middleware-api.service';
import { MiddlewareApiConfig } from './types';
import { MiddlewareApiAsyncOptions } from './interfaces';
import { AgentFactoryModule } from '../agent-factory/agent-factory.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [forwardRef(() => AgentFactoryModule), HttpModule],
  providers: [MiddlewareApiService],
  controllers: [MiddlewareApiController, MiddlewareUiController],
  exports: [MiddlewareApiService],
})
export class MiddlewareApiModule {
  public static forRoot(options: MiddlewareApiConfig): DynamicModule {
    return {
      module: MiddlewareApiModule,
      imports: [MiddlewareApiCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(
    options?: MiddlewareApiAsyncOptions,
  ): DynamicModule {
    return {
      module: MiddlewareApiModule,
      imports: [MiddlewareApiCoreModule.forRootAsync(options)],
    };
  }
}
