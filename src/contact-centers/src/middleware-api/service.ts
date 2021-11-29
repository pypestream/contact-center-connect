import { Service, EndUserService } from '../common/interfaces';
import {
  CccMessage,
  EndUserServices,
  AgentServices,
  MessageType,
  MiddlewareApiConfig,
  SendMessageResponse,
} from '../common/types';
import axis, { AxiosResponse } from 'axios';
import { ContactCenterProApiWebhookBody, SettingsObject } from './types';
import { components } from './types/openapi-types';
import { ServiceNowService } from '../service-now/service';
import { GenesysService } from '../genesys/service';
import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * MiddlewareApi service
 */
export class MiddlewareApiService
  implements
    Service<
      components['schemas']['Message'],
      components['schemas']['Message'],
      components['schemas']['Message']
    >,
    EndUserService
{
  config: MiddlewareApiConfig;

  constructor(config?: MiddlewareApiConfig) {
    this.config = config;
  }

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

  getAgentService(req, endUserService: EndUserServices): AgentServices {
    const integrationName = req.headers['x-pypestream-integration'];
    // console.log(integrationName)
    if (!integrationName) {
      throw new HttpException(
        'x-pypestream-integration header is null',
        HttpStatus.BAD_REQUEST,
      );
    }

    const configs = this.getCustomer(req);
    // console.log(configs)
    if (integrationName === 'ServiceNow') {
      return new ServiceNowService({
        instanceUrl: configs.instanceUrl,
        token: endUserService.config.token,
        middlewareApiUrl: endUserService.config.url,
      });
    }

    if (integrationName === 'Genesys') {
      return new GenesysService({
        instanceUrl: configs.instanceUrl,
        token: endUserService.config.token,
        middlewareApiUrl: endUserService.config.url,
        oAuthUrl: configs.oAuthUrl,
        clientId: configs.clientId,
        clientSecret: configs.clientSecret,
        grantType: configs.grantType,
        OMIntegrationId: configs.OMIntegrationId,
      });
    }

    return null;
  }

  /**
   * End conversation
   * @param conversationId
   */
  async endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const res = await axis.post(
      `${this.config.url}/contactCenter/v1/conversations/${conversationId}/end`,
      { senderId: 'test-agent' },
      {
        headers: {
          'x-pypestream-token': this.config.token,
        },
      },
    );
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
      `${this.config.url}/contactCenter/v1/conversations/${message.conversationId}/messages/${message.message.id}`,
      this.getMessageRequestBody(message),
      {
        headers: {
          'x-pypestream-token': this.config.token,
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
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const result = await axis.get(
      `${this.config.url}/contactCenter/v1/settings`,
      {
        headers: {
          'x-pypestream-token': this.config.token,
        },
      },
    );
    return result;
  }

  async putSettings(
    data: SettingsObject,
  ): Promise<AxiosResponse<components['schemas']['Setting']>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const result = await axis.put(
      `${this.config.url}/contactCenter/v1/settings`,
      data,
      {
        headers: {
          'x-pypestream-token': this.config.token,
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
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const response = await axis.get(
      `${this.config.url}/contactCenter/v1/conversations/${conversationId}/history`,
      {
        headers: {
          'x-pypestream-token': this.config.token,
        },
      },
    );

    return response;
  }

  /**
   * Get history of conversation
   */
  async waitTime(): Promise<AxiosResponse<components['schemas']['WaitTime']>> {
    if (!this.config.url) {
      throw new Error('MiddlewareApi instance-url must has value');
    }
    const response = await axis.get(
      `${this.config.url}/contactCenter/v1/agents/waitTime`,
      {
        headers: {
          'x-pypestream-token': this.config.token,
        },
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
    const response = await axis.post(
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
    return response;
  }
}
