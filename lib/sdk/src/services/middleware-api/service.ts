import {
  CcpMessage,
  MessageType,
  MiddlewareApiConfig,
  ContactCenterProConfig,
} from "../common/interfaces";
import axis, { AxiosResponse } from "axios";
import { ContactCenterProApiWebhookBody, SettingsObject } from "./types";
import { components } from "./types/openapi-types";

export class MiddlewareApiService {
  config: MiddlewareApiConfig;
  ccpConfig: ContactCenterProConfig;

  constructor(ccpConfig: ContactCenterProConfig, config: MiddlewareApiConfig) {
    this.config = config;
    this.ccpConfig = ccpConfig;
  }

  private sendMessageRequestBody(
    message: CcpMessage
  ): components["schemas"]["Message"] {
    return {
      content: message.message.value,
      senderId: message.sender.username,
      side: "ask Humberto",
    };
  }

  async sendMessage(
    message: CcpMessage
  ): Promise<AxiosResponse<components["schemas"]["Message"]>> {
    const res = await axis.post(
      `${this.config.instanceUrl}/contactCenter/v1/conversations/${message.conversationId}/messages/${message.message.id}`,
      this.sendMessageRequestBody(message)
    );
    return res;
  }

  mapToCcpMessage(body: ContactCenterProApiWebhookBody): CcpMessage {
    return {
      message: {
        value: body.body[0].value,
        type: MessageType.Text,
      },
      sender: {
        username: body.body[0].group,
      },
      conversationId: body.clientSessionId,
    };
  }

  isMessageSentByAgent(message: ContactCenterProApiWebhookBody): boolean {
    return message.body[0].agentInfo.sentFromAgent;
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
}
