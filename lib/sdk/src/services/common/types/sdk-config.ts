import {
  ContactCenterProConfig,
  MiddlewareApiConfig,
  ServiceNowConfig,
} from "./index";

/**
 * SDK configurations
 */
export type SdkConfig = {
  /**
   * CCP configurations
   */
  ccp?: ContactCenterProConfig;
  /**
   * ServiceNow configurations
   */
  serviceNow?: ServiceNowConfig;
  /**
   * MiddlewareApi configurations
   */
  middlewareApi?: MiddlewareApiConfig;
};
