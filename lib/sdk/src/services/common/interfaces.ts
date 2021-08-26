import {ServiceNowWebhookBody} from "../service-now/types";

type User = {
  username: string;
  email?: string;
};

export type CspMessage = {
  skill?: string,
  message:{
    id?: string;
    value: string;
  }
  sender: User;
  conversationId: string;
};

export type SendMessageResponse = {
  message: string;
  status: number
};

export interface Service {
  instanceUrl: string;
  sendMessage(
    message: CspMessage
  ): Promise<SendMessageResponse>;
  mapToCspMessage(message: ServiceNowWebhookBody):CspMessage
}

export enum ServiceEnum {
  ServiceNow,
  ContactCenterPro
}

export type ServiceConfig = {
  apiKey: string;
  serviceName: ServiceEnum;
};

export type CspConfig = {
  serviceNow?: ServiceNowConfig;
};


export type ServiceNowConfig = {
  apiKey: string;
  instanceUrl: string;
};
