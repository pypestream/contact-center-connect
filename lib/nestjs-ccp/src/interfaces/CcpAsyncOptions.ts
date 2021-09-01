import { ModuleMetadata, Type } from '@nestjs/common/interfaces';
import { CcpConfig } from '@ccp/sdk';
import { CcpOptionsFactory } from './CcpOptionsFactory';

export interface CcpAsyncOptions extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useClass?: Type<CcpOptionsFactory>;
  useExisting?: Type<CcpOptionsFactory>;
  useFactory?: (...args: any[]) => Promise<CcpConfig> | CcpConfig;
}
