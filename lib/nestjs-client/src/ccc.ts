import { MiddlewareApiConfig, SdkConfig } from './types';

/**
 * SDK Main class
 */
export class Ccc {
  /**
   * Constructor.
   *
   * @param config - services configurations
   *
   */

  public middlewareApi: MiddlewareApiConfig;

  constructor(
    config: SdkConfig = {
      middlewareApiConfig: {
        token: '',
        url: '',
      },
      enableLog: true,
    },
  ) {
    if (config.enableLog) {
      require('axios-debug-log/enable');
    }
    this.middlewareApi = config.middlewareApiConfig;
  }
}
