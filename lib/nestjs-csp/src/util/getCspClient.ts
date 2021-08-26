import { Csp, CspConfig } from '@csp/sdk';

export function getCspClient(configs: CspConfig): Csp {
  const cspClient = new Csp(configs);
  return cspClient;
}
