import { SdkConfig } from '../types';

export interface CcpOptionsFactory {
  createCcpOptions(): Promise<SdkConfig> | SdkConfig;
}
