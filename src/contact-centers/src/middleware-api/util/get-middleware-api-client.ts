import { MiddlewareApi } from '../middleware-api';
import { MiddlewareApiConfig } from '../types';

export function getMiddlewareApiClient(
  configs?: MiddlewareApiConfig,
): MiddlewareApi {
  const middlewareApiClient = new MiddlewareApi(configs);
  return middlewareApiClient;
}
