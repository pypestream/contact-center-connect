import { MiddlewareApiConfig } from './types';

/**
 * SDK Main class
 */
export class MiddlewareApi {
  /**
   * Constructor.
   *
   * @param config - services configurations
   *
   */

  public config: MiddlewareApiConfig;

  constructor(
    config: MiddlewareApiConfig = {
      token: '',
      url: '',
    },
  ) {
    this.config = config;
  }
}
