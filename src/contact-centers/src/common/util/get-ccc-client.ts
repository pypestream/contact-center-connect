import { Ccc } from '../../../ccc';
import { SdkConfig } from '../types';

export function getCccClient(configs?: SdkConfig): Ccc {
  const cccClient = new Ccc(configs);
  return cccClient;
}
