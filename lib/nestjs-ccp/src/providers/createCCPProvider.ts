import { Provider } from '@nestjs/common';
import { Ccp } from '../ccp';
import { SdkConfig } from '../types';
import { ccpToken } from './../constants';
import { getCcpClient } from './../util';

export function createCcpProvider(options: SdkConfig): Provider<Ccp> {
  return {
    provide: ccpToken,
    useValue: getCcpClient(options),
  };
}
