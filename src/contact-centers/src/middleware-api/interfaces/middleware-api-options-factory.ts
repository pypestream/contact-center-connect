import { MiddlewareApiConfig } from '../types';

export interface MiddlewareApiOptionsFactory {
  createMiddlewareApiOptions():
    | Promise<MiddlewareApiConfig>
    | MiddlewareApiConfig;
}
