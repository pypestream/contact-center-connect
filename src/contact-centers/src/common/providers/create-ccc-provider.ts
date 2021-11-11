import { Provider } from '@nestjs/common';
import { Ccc } from '../../../ccc';
import { SdkConfig } from '../types';
import { cccToken } from './../constants';
import { getCccClient } from './../util';

export function createCccProvider(options: SdkConfig): Provider<Ccc> {
  return {
    provide: cccToken,
    useValue: getCccClient(options),
  };
}
