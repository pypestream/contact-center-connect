import { SdkConfig } from '../types';

export interface CccOptionsFactory {
  createCccOptions(): Promise<SdkConfig> | SdkConfig;
}
