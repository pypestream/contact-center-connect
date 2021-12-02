import { Provider } from '@nestjs/common';
import { MiddlewareApi } from '../middleware-api';
import { MiddlewareApiConfig } from '../types';
import { MiddlewareApiToken } from './../constants';
import { getMiddlewareApiClient } from './../util';

export function createMiddlewareApiProvider(
  options: MiddlewareApiConfig,
): Provider<MiddlewareApi> {
  return {
    provide: MiddlewareApiToken,
    useValue: getMiddlewareApiClient(options),
  };
}
