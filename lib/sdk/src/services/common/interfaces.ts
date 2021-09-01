type User = {
  username: string;
  email?: string;
};

export type CcpMessage = {
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
  sendMessage(message: CcpMessage): Promise<SendMessageResponse>;
  mapToCcpMessage(message: T): CcpMessage;
  isMessageSentByAgent(message: T): boolean;
  isChatEnded(message: T): boolean;
  isAvailable(): boolean;
  waitTime(): boolean;
}

export enum ServiceEnum {
  ServiceNow,
  ContactCenterPro,
}

export enum MessageType {
  Text,
  Image,
}

export type CcpConfig = {
  ccp?: ContactCenterProConfig,
  serviceNow?: ServiceNowConfig;
  middlewareApi?: MiddlewareApiConfig;
};

export type ServiceNowConfig = {
  instanceUrl: string;
};

export type MiddlewareApiConfig = {
  instanceUrl: string;
  token: string;
};

export type ContactCenterProConfig = {
  instanceUrl: string;
};