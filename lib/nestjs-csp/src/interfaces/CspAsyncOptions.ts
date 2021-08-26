import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { CspConfig } from '@csp/sdk';
import { CspOptionsFactory } from './CspOptionsFactory';

export interface CspAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<CspOptionsFactory>;
  useExisting?: Type<CspOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<CspConfig> | CspConfig;
}
