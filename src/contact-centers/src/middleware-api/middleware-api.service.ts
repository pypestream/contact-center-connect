import { Service } from '../common/interfaces';
import { CccMessage, MessageType, SendMessageResponse } from '../common/types';
import {
  ContactCenterProApiWebhookBody,
  MiddlewareApiConfig,
  privateComponents,
  SettingsObject,
} from './types';
import { components } from './types/openapi-types';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosRequestHeaders } from 'axios';
import { InjectMiddlewareApi } from './decorators/index';
import { MiddlewareApi } from './middleware-api';
import { AxiosResponse } from 'axios';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';
import { FeatureFlagEnum } from '../feature-flag/feature-flag.enum';
import { publicComponents } from '../middleware-api/types';
/**
 * MiddlewareApi service
 */
@Injectable()
export class MiddlewareApiService
  implements
    Service<
      components['schemas']['Message'],
      components['schemas']['Message'],
      components['schemas']['Message']
    >
{
  config: MiddlewareApiConfig;

  constructor(
    @InjectMiddlewareApi() middlewareApi: MiddlewareApi,
    private httpService: HttpService,
    private readonly featureFlagService: FeatureFlagService,
  ) {
    this.config = middlewareApi.config;
  }

  private async getHeaders(): Promise<AxiosRequestHeaders> {
    const isPE19446FlagEnabled = await this.featureFlagService.isFlagEnabled(
      FeatureFlagEnum.PE_19446,
    );
    return isPE19446FlagEnabled
      ? {
          Authorization: `Basic ${this.config.basicToken}`,
        }
      : {
          'x-pypestream-token': this.config.token,
        };
  }
  /**
   * End conversation
   * @param conversationId
   */
  async endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const headers = await this.getHeaders();
    return this.httpService
      .post(
        `${this.config.url}/contactCenter/v1/conversations/${conversationId}/end`,
        { senderId: 'test-agent' },
        { headers },
      )
      .toPromise();
  }

  /**
   * Determine if end-user is typing or viewing based on request body
   * @param message
   */
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  isTyping(message: components['schemas']['Message']): boolean {
    return true;
  }

  /**
   * Determine if end-user is available to receive new message
   * @param message
   */
  //eslint-disable-next-line @typescript-eslint/no-unused-vars
  isAvailable(skill: string): Promise<boolean> {
    return Promise.resolve(true);
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
    return '0';
  }

  /**
   * @ignore
   */

  private getMessageRequestBody(
    message: CccMessage,
  ): components['schemas']['Message'] {
    return {
      content: message.message.value,
      senderId: message.sender.username,
      side: 'agent',
    };
  }
  /**
   * Send message to MiddlewareApi
   * @param message
   */
  async sendMessage(
    message: CccMessage,
    metadata?: publicComponents['schemas']['Metadata'],
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const headers = await this.getHeaders();
    return this.httpService
      .put(
        `${this.config.url}/contactCenter/v1/conversations/${message.conversationId}/messages/${message.message.id}`,
        this.getMessageRequestBody(message),
        { headers },
      )
      .toPromise();
  }
  /**
   * Convert posted body to CCC message
   * @param body
   * @param params
   */
  mapToCccMessage(
    body: components['schemas']['Message'],
    params: { conversationId: string; messageId: string },
  ): CccMessage {
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
    AxiosResponse<components['schemas']['Setting']>
  > {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const headers = await this.getHeaders();
    return this.httpService
      .get(`${this.config.url}/contactCenter/v1/settings`, { headers })
      .toPromise();
  }

  async putSettings(
    data: SettingsObject,
  ): Promise<AxiosResponse<components['schemas']['Setting']>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const headers = await this.getHeaders();
    const result = this.httpService.put(
      `${this.config.url}/contactCenter/v1/settings`,
      data,
      headers,
    );
    return result.toPromise();
  }
  /**
   * Get history of conversation
   * @param conversationId
   */
  async history(
    conversationId: string,
  ): Promise<AxiosResponse<components['schemas']['History']>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const headers = await this.getHeaders();
    const response = this.httpService.get(
      `${this.config.url}/contactCenter/v2/conversations/${conversationId}/history`,
      { headers, params: { pageSize: 1000 } },
    );

    return response.toPromise();
  }

  /**
   * Get metadata of conversation
   * @param conversationId
   */
  async metadata(
    conversationId: string,
  ): Promise<AxiosResponse<components['schemas']['Metadata']>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const headers = await this.getHeaders();
    const response = this.httpService.get(
      `${this.config.url}/contactCenter/v1/conversations/${conversationId}/metadata`,
      { headers },
    );

    return response.toPromise();
  }

  /**
   * Patch metadata of conversation
   * @param conversationId
   * @param agentMetadata
   */
  async updateAgentMetadata(
    conversationId: string,
    agentMetadata: any,
  ): Promise<AxiosResponse<components['schemas']['Metadata']>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const headers = await this.getHeaders();
    const response = this.httpService.patch(
      `${this.config.url}/contactCenter/v1/conversations/${conversationId}/metadata`,
      { agent: agentMetadata },
      { headers },
    );

    return response.toPromise();
  }

  /**
   * Get history of conversation
   */
  async waitTime(): Promise<
    AxiosResponse<privateComponents['schemas']['WaitTime']>
  > {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const headers = await this.getHeaders();
    const response = this.httpService.get(
      `${this.config.url}/contactCenter/v1/agents/waitTime`,
      { headers },
    );

    return response.toPromise();
  }

  /**
   * Send is typing indicator to service
   * @param conversationId
   * @param isTyping
   */
  async sendTyping(
    conversationId: string,
    isTyping: boolean,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    if (!conversationId) {
      throw new Error(
        'MiddlewareApi.sendTyping conversationId param is required parameter',
      );
      return null;
    }
    const headers = await this.getHeaders();
    const response = this.httpService.post(
      `${this.config.url}/contactCenter/v1/conversations/${conversationId}/type`,
      {
        typing: isTyping,
      },
      { headers },
    );
    return response.toPromise();
  }
}
