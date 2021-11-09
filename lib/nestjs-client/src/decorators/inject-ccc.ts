import { Inject } from '@nestjs/common';
import { cccToken } from './../constants';

export function InjectCcc() {
  return Inject(cccToken);
}
