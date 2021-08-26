import { Provider } from '@nestjs/common';
import {Csp, CspConfig} from '@csp/sdk';
import { cspToken } from './../constants';
import { getCspClient } from './../util';

export function createCspProvider(options: CspConfig): Provider<Csp> {
  return {
    provide: cspToken,
    useValue: getCspClient(options),
  };
}
