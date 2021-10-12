import { Provider } from '@nestjs/common';
import {Ccp, CcpConfig} from '@ccp/sdk';
import { ccpToken } from './../constants';
import { getCcpClient } from './../util';

export function createCcpProvider(options: CcpConfig): Provider<Ccp> {
  return {
    provide: ccpToken,
    useValue: getCcpClient(options),
  };
}
