import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { MiddlewareApiConfig } from '../types';
import { MiddlewareApiOptionsFactory } from './middleware-api-options-factory';

export interface MiddlewareApiAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<MiddlewareApiOptionsFactory>;
  useExisting?: Type<MiddlewareApiOptionsFactory>;
  useFactory?: (
    ...args: any[]
  ) => Promise<MiddlewareApiConfig> | MiddlewareApiConfig;
}
