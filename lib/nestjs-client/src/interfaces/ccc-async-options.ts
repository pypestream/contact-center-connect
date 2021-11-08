import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { SdkConfig } from '../types';
import { CccOptionsFactory } from './CccOptionsFactory';

export interface CccAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<CccOptionsFactory>;
  useExisting?: Type<CccOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<SdkConfig> | SdkConfig;
}
