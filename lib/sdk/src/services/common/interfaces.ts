import { ServiceNowWebhookBody } from "../service-now/types";

type User = {
  username: string;
  email?: string;
};

export type CspMessage = {
  skill?: string;
  message: {
    id?: string;
    value: string;
    type: MessageType;
  };
  sender: User;
  conversationId: string;
};

export type SendMessageResponse = {
  message: string;
  status: number;
};

export interface Service<T> {
  instanceUrl: string;
  sendMessage(message: CspMessage): Promise<SendMessageResponse>;
  mapToCspMessage(message: T): CspMessage;
  isMessageSentByAgent(message: T): boolean;
  isChatEnded(message: T): boolean;
}

export enum ServiceEnum {
  ServiceNow,
  ContactCenterPro,
}

export enum MessageType {
  Text,
  Image,
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
