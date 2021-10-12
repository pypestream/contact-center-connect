import {
  ContactCenterProConfig,
  MiddlewareApiConfig,
  ServiceNowConfig,
} from "./index";

export type CcpConfig = {
  ccp?: ContactCenterProConfig;
  serviceNow?: ServiceNowConfig;
  middlewareApi?: MiddlewareApiConfig;
};
