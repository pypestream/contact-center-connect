import { MiddlewareApiConfig } from './middleware-api-config';
/**
 * SDK configurations
 */
export type SdkConfig = {
  /**
   * Enable log
   */
  enableLog?: boolean;
  middlewareApiConfig?: MiddlewareApiConfig;
};
