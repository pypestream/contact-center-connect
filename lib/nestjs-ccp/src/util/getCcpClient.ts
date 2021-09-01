import { Ccp, CcpConfig } from '@ccp/sdk';

export function getCcpClient(configs: CcpConfig): Ccp {
  const ccpClient = new Ccp(configs);
  return ccpClient;
}
