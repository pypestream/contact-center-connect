import { Ccp, SdkConfig } from '@ccp/sdk';

export function getCcpClient(configs: SdkConfig): Ccp {
  const ccpClient = new Ccp(configs);
  return ccpClient;
}
