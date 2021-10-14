import { SdkConfig } from '@ccp/sdk';

export interface CcpOptionsFactory {
  createCcpOptions(): Promise<SdkConfig> | SdkConfig;
}
