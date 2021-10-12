import { CcpConfig } from '@ccp/sdk';

export interface CcpOptionsFactory {
  createCcpOptions(): Promise<CcpConfig> | CcpConfig;
}
