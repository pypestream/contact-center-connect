import { Inject } from '@nestjs/common';
import { ccpToken } from './../constants';

export function InjectCcp() {
  return Inject(ccpToken);
}
