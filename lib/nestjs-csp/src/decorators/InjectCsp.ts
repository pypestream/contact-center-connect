import { Inject } from '@nestjs/common';
import { cspToken } from './../constants';

export function InjectCsp() {
  return Inject(cspToken);
}
