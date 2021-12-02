import { Inject } from '@nestjs/common';
import { MiddlewareApiToken } from './../constants';

export function InjectMiddlewareApi() {
  return Inject(MiddlewareApiToken);
}
