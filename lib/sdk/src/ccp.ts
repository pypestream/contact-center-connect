import { CcpConfig } from "./services/common/types";
import { ServiceNowService } from "./services/service-now/service";
import { MiddlewareApiService } from "./services/middleware-api/service";

export class Ccp {
  private readonly _serviceNowService: InstanceType<typeof ServiceNowService> =
    null;
  private readonly _middlewareApiService: InstanceType<
    typeof MiddlewareApiService
  > = null;
  private readonly _config: CcpConfig = null;

  constructor(config: CcpConfig) {
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
  }

  get serviceNowService() {
    return this._serviceNowService;
  }

  get middlewareApiService() {
    return this._middlewareApiService;
  }

  get config() {
    return this._config;
  }
}
