import { Ccp } from '../ccp';
import { SdkConfig } from '../types';

export function getCcpClient(configs?: SdkConfig): Ccp {
  const ccpClient = new Ccp(configs);
  return ccpClient;
}
