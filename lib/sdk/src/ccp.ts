import { SdkConfig } from "./services/common/types";
import { ServiceNowService } from "./services/service-now/service";
import { MiddlewareApiService } from "./services/middleware-api/service";

/**
 * SDK Main class
 */
export class Ccp {
  /**
   * @ignore
   */
  private readonly _serviceNowService: InstanceType<typeof ServiceNowService> =
    null;
  /**
   * @ignore
   */
  private readonly _middlewareApiService: InstanceType<
    typeof MiddlewareApiService
  > = null;
  /**
   * @ignore
   */
  private readonly _config: SdkConfig = null;

  /**
   * Constructor.
   *
   * @param config - services configurations
   *
   */

  constructor(config: SdkConfig) {
    this._config = config;
    if (config.serviceNow) {
      this._serviceNowService = new ServiceNowService(
        config.ccp,
        config.serviceNow
      );
    }
    if (config.middlewareApi) {
      this._middlewareApiService = new MiddlewareApiService(
        config.ccp,
        config.middlewareApi
      );
    }
    require("axios-debug-log/enable");
  }

  /**
   * Get ServiceNow service instance
   */
  get serviceNowService() {
    return this._serviceNowService;
  }

  /**
   * Get MiddlewareApi service instance
   */
  get middlewareApiService() {
    return this._middlewareApiService;
  }

  //
  /**
   * Get current configurations
   */
  get config() {
    return this._config;
  }
}
