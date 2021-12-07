import { Service } from '../common/interfaces';
import { CccMessage, MessageType, SendMessageResponse } from '../common/types';
import {
  ContactCenterProApiWebhookBody,
  MiddlewareApiConfig,
  SettingsObject,
} from './types';
import { components } from './types/openapi-types';
import { Injectable } from '@nestjs/common';
import { InjectMiddlewareApi } from './decorators/index';
import { MiddlewareApi } from './middleware-api';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';

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
  ) {
    this.config = middlewareApi.config;
  }

  /**
   * End conversation
   * @param conversationId
   */
  endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    return this.httpService
      .post(
        `${this.config.url}/contactCenter/v1/conversations/${conversationId}/end`,
        { senderId: 'test-agent' },
        {
          headers: {
            'x-pypestream-token': this.config.token,
          },
        },
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
  sendMessage(
    message: CccMessage,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    return this.httpService
      .put(
        `${this.config.url}/contactCenter/v1/conversations/${message.conversationId}/messages/${message.message.id}`,
        this.getMessageRequestBody(message),
        {
          headers: {
            'x-pypestream-token': this.config.token,
          },
        },
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

  getSettings(): Promise<AxiosResponse<components['schemas']['Setting']>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    return this.httpService
      .get(`${this.config.url}/contactCenter/v1/settings`, {
        headers: {
          'x-pypestream-token': this.config.token,
        },
      })
      .toPromise();
  }

  putSettings(
    data: SettingsObject,
  ): Promise<AxiosResponse<components['schemas']['Setting']>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const result = this.httpService.put(
      `${this.config.url}/contactCenter/v1/settings`,
      data,
      {
        headers: {
          'x-pypestream-token': this.config.token,
        },
      },
    );
    return result.toPromise();
  }
  /**
   * Get history of conversation
   * @param conversationId
   */
  history(
    conversationId: string,
  ): Promise<AxiosResponse<components['schemas']['History']>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const response = this.httpService.get(
      `${this.config.url}/contactCenter/v1/conversations/${conversationId}/history`,
      {
        headers: {
          'x-pypestream-token': this.config.token,
        },
      },
    );

    return response.toPromise();
  }

  /**
   * Get history of conversation
   */
  waitTime(): Promise<AxiosResponse<components['schemas']['WaitTime']>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const response = this.httpService.get(
      `${this.config.url}/contactCenter/v1/agents/waitTime`,
      {
        headers: {
          'x-pypestream-token': this.config.token,
        },
      },
    );

    return response.toPromise();
  }

  /**
   * Send is typing indicator to service
   * @param conversationId
   * @param isTyping
   */
  sendTyping(
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
    const response = this.httpService.post(
      `${this.config.url}/contactCenter/v1/conversations/${conversationId}/type`,
      {
        typing: isTyping,
      },
      {
        headers: {
          'x-pypestream-token': this.config.token,
        },
      },
    );
    return response.toPromise();
  }
}
