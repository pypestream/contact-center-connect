import { Service, EndUserService } from '../common/interfaces';
import {
  CccMessage,
  EndUserServices,
  MessageType,
  MiddlewareApiConfig,
  SendMessageResponse,
} from '../common/types';
import axis, { AxiosResponse } from 'axios';
import { ContactCenterProApiWebhookBody, SettingsObject } from './types';
import { components } from './types/openapi-types';
import { ServiceNowService } from '../service-now/service-now.service';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { cccToken } from '../common/constants';
import { Ccc } from '../../ccc';

/**
 * MiddlewareApi service
 */
@Injectable()
export class MiddlewareApiService
  implements
    Service<
      components['schemas']['Message'],
      components['schemas']['Message'],
      components['schemas']['Message'],
      MiddlewareApiConfig
    >,
    EndUserService
{
  config: MiddlewareApiConfig;

  constructor(@Inject(cccToken) private readonly ccc: Ccc) {}

  getCustomer(req) {
    const base64Customer = req.headers['x-pypestream-customer'];
    if (!base64Customer) {
      throw new Error('x-pypestream-customer header is null');
    }
    const stringifyCustomer = Buffer.from(base64Customer, 'base64').toString(
      'ascii',
    );
    const customer = JSON.parse(stringifyCustomer);
    return customer;
  }

  getAgentService(req, endUserService: EndUserServices): ServiceNowService {
    const integrationName = req.headers['x-pypestream-integration'];
    if (!integrationName) {
      throw new HttpException(
        'x-pypestream-integration header is null',
        HttpStatus.BAD_REQUEST,
      );
    }

    const configs = this.getCustomer(req);

    if (integrationName === 'ServiceNow') {
      return new ServiceNowService({
        instanceUrl: configs.instanceUrl,
        token: endUserService.config.token,
        middlewareApiUrl: endUserService.config.url,
      });
    }
    return null;
  }

  /**
   * End conversation
   * @param conversationId
   */
  async endConversation(
    config: MiddlewareApiConfig,
    conversationId: string,
  ): Promise<AxiosResponse<any>> {
    if (!this.ccc.middlewareApi.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const url = `${config.url}/contactCenter/v1/conversations/${conversationId}/end`;
    const body = { senderId: 'test-agent' };
    const headers = {
      'x-pypestream-token': config.token,
    };
    const res = await axis.post(url, body, {
      headers,
    });
    return res;
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
  async sendMessage(
    message: CccMessage,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const res = await axis.put(
      `${this.ccc.middlewareApi.url}/contactCenter/v1/conversations/${message.conversationId}/messages/${message.message.id}`,
      this.getMessageRequestBody(message),
      {
        headers: {
          'x-pypestream-token': this.ccc.middlewareApi.token,
        },
      },
    );
    return res;
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
    if (!this.ccc.middlewareApi.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const result = await axis.get(
      `${this.ccc.middlewareApi.url}/contactCenter/v1/settings`,
      {
        headers: {
          'x-pypestream-token': this.ccc.middlewareApi.token,
        },
      },
    );
    return result;
  }

  async putSettings(
    data: SettingsObject,
  ): Promise<AxiosResponse<components['schemas']['Setting']>> {
    if (!this.ccc.middlewareApi.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const result = await axis.put(
      `${this.ccc.middlewareApi.url}/contactCenter/v1/settings`,
      data,
      {
        headers: {
          'x-pypestream-token': this.ccc.middlewareApi.token,
        },
      },
    );
    return result;
  }
  /**
   * Get history of conversation
   * @param conversationId
   */
  async history(
    conversationId: string,
  ): Promise<AxiosResponse<components['schemas']['History']>> {
    if (!this.ccc.middlewareApi.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const response = await axis.get(
      `${this.ccc.middlewareApi.url}/contactCenter/v1/conversations/${conversationId}/history`,
      {
        headers: {
          'x-pypestream-token': this.ccc.middlewareApi.token,
        },
      },
    );

    return response;
  }

  /**
   * Get history of conversation
   */
  async waitTime(
    middlewareApi: MiddlewareApiConfig,
  ): Promise<AxiosResponse<components['schemas']['WaitTime']>> {
    if (!this.ccc.middlewareApi.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const headers = {
      'x-pypestream-token': middlewareApi.token,
    };
    const response = await axis.get(
      `${this.ccc.middlewareApi.url}/contactCenter/v1/agents/waitTime`,
      {
        headers,
      },
    );

    return response;
  }

  /**
   * Send is typing indicator to service
   * @param conversationId
   * @param isTyping
   */
  async sendTyping(
    config: MiddlewareApiConfig,
    conversationId: string,
    isTyping: boolean,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (!conversationId) {
      throw new Error(
        'MiddlewareApi.sendTyping conversationId param is required parameter',
      );
      return null;
    }
    const url = `${config.url}/contactCenter/v1/conversations/${conversationId}/type`;
    const body = {
      typing: isTyping,
    };
    const headers = {
      'x-pypestream-token': config.token,
    };
    const response = await axis.post(url, body, {
      headers,
    });
    return response;
  }
}
