import { AxiosResponse } from 'axios';
import { SendMessageResponse } from './../types/send-message-response';
import { CcpMessage } from './../types/ccs-message';

/**
 * Service should implement this interface for core features interface
 *
 */
export interface Service<T, Y, Z> {
  /**
   * Send message to service
   * @param message
   */
  sendMessage(message: CcpMessage): Promise<AxiosResponse<SendMessageResponse>>;

  /**
   * End conversation
   * @param conversationId
   */
  endConversation(conversationId: string): Promise<AxiosResponse<any>>;

  /**
   * Convert posted body to CCP message
   * @param body
   * @param params
   */
  mapToCcpMessage(
    body: T,
    params: { conversationId: string; messageId: string; index: number },
  ): CcpMessage;

  /**
   * Determine if user/agent is typing or viewing based on request body
   * @param message
   */
  isTyping(body: Y): boolean;

  /**
   * Determine if user/agent is available to receive new message
   * @param message
   */
  isAvailable(skill: string): boolean;

  /**
   * Return estimated wait time in seconds
   * @param message
   */
  getWaitTime(body: Z): string;

  /**
   * Send is typing indicator to service
   * @param conversationId
   * @param isTyping
   */
  sendTyping(
    conversationId: string,
    isTyping: boolean,
  ): Promise<AxiosResponse<SendMessageResponse>>;
}
