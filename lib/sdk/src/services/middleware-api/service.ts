import { Service } from "../common/interfaces";
import {
  CcpMessage,
  ContactCenterProConfig,
  MessageType,
  MiddlewareApiConfig,
  SendMessageResponse,
} from "./../common/types";
import axis, { AxiosResponse } from "axios";
import { ContactCenterProApiWebhookBody, SettingsObject } from "./types";
import { components } from "./types/openapi-types";

/**
 * MiddlewareApi service
 */
export class MiddlewareApiService
  implements
    Service<
      components["schemas"]["Message"],
      components["schemas"]["Message"],
      components["schemas"]["Message"]
    >
{
  config: MiddlewareApiConfig;
  ccpConfig: ContactCenterProConfig;

  constructor(ccpConfig: ContactCenterProConfig, config: MiddlewareApiConfig) {
    this.config = config;
    this.ccpConfig = ccpConfig;
  }
  /**
   * Start new conversation with initial message
   * @param message
   */
  startConversation(
    //eslint-disable-next-line @typescript-eslint/no-unused-vars
    message: CcpMessage
  ): Promise<AxiosResponse<SendMessageResponse>> {
    throw new Error(
      "Middleware API is end-user platform, agent can not start conversation with end-user"
    );
  }
  /**
   * End conversation
   * @param conversationId
   */
  async endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    const res = await axis.post(
      `${this.config.instanceUrl}/contactCenter/v1/conversations/${conversationId}/end`,
      { senderId: "test-agent" },
      {
        headers: {
          "x-pypestream-token": this.config.token,
        },
      }
    );
    return res;
  }

  /**
   * Determine if end-user is typing or viewing based on request body
   * @param message
   */
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  isTyping(message: components["schemas"]["Message"]): boolean {
    return true;
  }

  /**
   * Determine if end-user is available to receive new message
   * @param message
   */
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  isAvailable(skill: string): boolean {
    return true;
  }

  /**
   * Return estimated wait time in seconds
   * @param message
   */
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  getWaitTime(message: {
    content: string;
    senderId: string;
    side: string;
  }): string {
    return "0";
  }

  /**
   * @ignore
   */

  private getMessageRequestBody(
    message: CcpMessage
  ): components["schemas"]["Message"] {
    return {
      content: message.message.value,
      senderId: message.sender.username,
      side: "agent",
    };
  }
  /**
   * Send message to MiddlewareApi
   * @param message
   */
  async sendMessage(
    message: CcpMessage
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const res = await axis.put(
      `${this.config.instanceUrl}/contactCenter/v1/conversations/${message.conversationId}/messages/${message.message.id}`,
      this.getMessageRequestBody(message),
      {
        headers: {
          "x-pypestream-token": this.config.token,
        },
      }
    );
    return res;
  }
  /**
   * Convert posted body to CCP message
   * @param body
   * @param params
   */
  mapToCcpMessage(
    body: components["schemas"]["Message"],
    params: { conversationId: string; messageId: string }
  ): CcpMessage {
    const { conversationId, messageId } = params;
    return {
      message: {
        id: messageId,
        value: body.content,
        type: MessageType.Text,
      },
      sender: {
        username: body.senderId,
      },
      conversationId,
    };
  }

  isChatEnded(message: ContactCenterProApiWebhookBody): boolean {
    return message.completed;
  }

  async getSettings(): Promise<
    AxiosResponse<components["schemas"]["Setting"]>
  > {
    const result = await axis.get(
      `${this.config.instanceUrl}/contactCenter/v1/settings`
    );
    return result;
  }

  async putSettings(
    data: SettingsObject
  ): Promise<AxiosResponse<components["schemas"]["Setting"]>> {
    const result = await axis.put(
      `${this.config.instanceUrl}/contactCenter/v1/settings`,
      data,
      {
        headers: {
          "x-pypestream-token": this.config.token,
        },
      }
    );
    return result;
  }

  async history(
    conversationId: string
  ): Promise<AxiosResponse<components["schemas"]["History"]>> {
    const response = await axis.get(
      `${this.config.instanceUrl}/contactCenter/v1/conversations/${conversationId}/history`,
      {
        headers: {
          "x-pypestream-token": this.config.token,
        },
      }
    );

    return response;
  }
  /**
   * Send is typing indicator to service
   * @param conversationId
   * @param isTyping
   */
  async sendTyping(
    conversationId: string,
    isTyping: boolean
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (!conversationId) {
      throw new Error(
        "MiddlewareApi.sendTyping conversationId param is required parameter"
      );
      return null;
    }
    const response = await axis.post(
      `${this.config.instanceUrl}/contactCenter/v1/conversations/${conversationId}/type`,
      {
        type: isTyping,
      },
      {
        headers: {
          "x-pypestream-token": this.config.token,
        },
      }
    );
    return response;
  }
}
