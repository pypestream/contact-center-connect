import { DynamicModule, ValidationPipe } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { APP_PIPE } from '@nestjs/core';
import { MiddlewareApiController } from './middleware-api.controller';
import { MiddlewareUiController } from './middleware-ui.controller';
import { MiddlewareApiCoreModule } from './middleware-api-core.module';
import { MiddlewareApiConfig } from './types';
import { MiddlewareApiAsyncOptions } from './interfaces';
import { BodyMiddleware } from '../common/middlewares/body-middleware';
import { MiddlewareConsumer } from '@nestjs/common';

@Module({
  imports: [
    MiddlewareApiCoreModule.forRoot({
      url: process.env.MIDDLEWARE_API_URL,
      token: process.env.MIDDLEWARE_API_TOKEN,
    }),
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
  controllers: [MiddlewareApiController, MiddlewareUiController],
  exports: [],
})
export class MiddlewareApiModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(BodyMiddleware).forRoutes(MiddlewareApiController);
  }
  public static forRoot(options: MiddlewareApiConfig): DynamicModule {
    return {
      module: MiddlewareApiModule,
      providers: [
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
      controllers: [MiddlewareApiController, MiddlewareUiController],
      imports: [MiddlewareApiCoreModule.forRoot(options)],
    };
  }

  public static forRootAsync(
    options?: MiddlewareApiAsyncOptions,
  ): DynamicModule {
    return {
      module: MiddlewareApiModule,
      controllers: [MiddlewareApiController, MiddlewareUiController],
      imports: [MiddlewareApiCoreModule.forRootAsync(options)],
      providers: [
        {
          provide: APP_PIPE,
          useClass: ValidationPipe,
        },
      ],
    };
  }
}
