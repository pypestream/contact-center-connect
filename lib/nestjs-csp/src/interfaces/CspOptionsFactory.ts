import { CspConfig } from '@csp/sdk';

export interface CspOptionsFactory {
  createCspOptions(): Promise<CspConfig> | CspConfig;
}
