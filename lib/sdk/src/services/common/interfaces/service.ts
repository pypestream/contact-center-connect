import { AxiosResponse } from "axios";
import { SendMessageResponse } from "./../types/send-message-response";
import { CcpMessage } from "./../types/ccs-message";

export interface Service<T> {
  sendMessage(message: CcpMessage): Promise<AxiosResponse<SendMessageResponse>>;
  startConversation(
    message: CcpMessage
  ): Promise<AxiosResponse<SendMessageResponse>>;
  endConversation(conversationId: string): Promise<AxiosResponse<any>>;
  mapToCcpMessage(
    message: T,
    params: { conversationId: string; messageId: string; index: number }
  ): CcpMessage;
  isTyping(message: T): boolean;
  isAvailable(skill: string): boolean;
  getWaitTime(message: T): string;
  sendTyping(
    conversationId: string,
    isTyping: boolean
  ): Promise<AxiosResponse<SendMessageResponse>>;
}
