import { Service } from "../common/interfaces";
import {
  CcpMessage,
  ContactCenterProConfig,
  MessageType,
  MiddlewareApiConfig,
  SendMessageResponse,
} from "../common/types";
import axis, { AxiosResponse } from "axios";
import { ContactCenterProApiWebhookBody, SettingsObject } from "./types";
import { components } from "./types/openapi-types";

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

  startConversation(
    message: CcpMessage
  ): Promise<AxiosResponse<SendMessageResponse>> {
    throw new Error(
      "Middleware API is end-user platform, agent can not start conversation with end-user"
    );
  }

  async endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    const res = await axis.post(
      `${this.config.instanceUrl}/contactCenter/v1/conversations/${conversationId}/end`,
      { senderId: "agent" }
    );
    return res;
  }

  isTyping(message: components["schemas"]["Message"]): boolean {
    return true;
  }

  isAvailable(skill: string): boolean {
    return true;
  }

  getWaitTime(message: {
    content: string;
    senderId: string;
    side: string;
  }): string {
    return "0";
  }

  private getMessageRequestBody(
    message: CcpMessage
  ): components["schemas"]["Message"] {
    return {
      content: message.message.value,
      senderId: message.sender.username,
      side: "agent",
    };
  }

  async sendMessage(
    message: CcpMessage
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const res = await axis.post(
      `${this.config.instanceUrl}/contactCenter/v1/conversations/${message.conversationId}/messages/${message.message.id}`,
      this.getMessageRequestBody(message)
    );
    return res;
  }

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

  async sendEnd(
    conversationId: string
  ): Promise<AxiosResponse<components["schemas"]["History"]>> {
    const response = await axis.post(
      `${this.config.instanceUrl}/contactCenter/v1/conversations/${conversationId}/end`,
      {
        senderId: "agent",
      },
      {
        headers: {
          "x-pypestream-token": this.config.token,
        },
      }
    );
    return response;
  }

  async sendTyping(
    conversationId: string,
    isTyping: boolean
  ): Promise<AxiosResponse<SendMessageResponse>> {
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
