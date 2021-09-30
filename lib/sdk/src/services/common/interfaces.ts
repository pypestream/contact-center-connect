import { AxiosResponse } from "axios";

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
  sendMessage(message: CcpMessage): Promise<AxiosResponse<SendMessageResponse>>;
  startConversation(
    message: CcpMessage
  ): Promise<AxiosResponse<SendMessageResponse>>;
  endConversation(conversationId: string): Promise<AxiosResponse<any>>;
  mapToCcpMessage(message: T, index: number): CcpMessage;
  hasChatEndedAction(message: T): boolean;
  hasNewMessageAction(message: T): boolean;
  hasTypingIndicatorAction(message: T): boolean;
  isAvailable(skill: string): boolean;
  waitTime(message: T): string;
  sendTyping(
    conversationId: string,
    isTyping: boolean
  ): Promise<AxiosResponse<SendMessageResponse>>;
}

export enum ServiceEnum {
  ServiceNow,
  ContactCenterPro,
}

export enum MessageType {
  Text,
  Image,
}

export enum MessageAction {
  END_CONVERSATION = "END_CONVERSATION",
  START_CONVERSATION = "START_CONVERSATION",
  AGENT = "AGENT",
}

export type CcpConfig = {
  ccp?: ContactCenterProConfig;
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
