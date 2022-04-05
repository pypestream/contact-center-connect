import {
  CccMessage,
  MessageType,
  SendMessageResponse,
} from './../common/types';
import { Service, AgentService } from '../common/interfaces';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { v4 as uuidv4 } from 'uuid';
import { GenesysWebhookBody, GenesysCustomer } from './types';
import { getCustomer } from '../common/utils/get-customer';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';
import { Request } from 'express';
import { Inject, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Scope, HttpService } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { GenesysWebsocket } from './genesys.websocket';

/* eslint-disable */
const qs = require('qs');
/* eslint-disable */
const inboundUrl = '/api/v2/conversations/messages/inbound/open';

@Injectable({ scope: Scope.REQUEST })
export class GenesysService
  implements
    Service<GenesysWebhookBody, GenesysWebhookBody, GenesysWebhookBody>,
    AgentService
{
  /**
   * @ignore
   */
  private customer: GenesysCustomer;
  private readonly logger = new Logger(GenesysService.name);

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectMiddlewareApi() private readonly middlewareApi: MiddlewareApi,
    private readonly genesysWebsocket: GenesysWebsocket,
    private httpService: HttpService,
  ) {
    const base64Customer = this.request.headers['x-pypestream-customer'];
    const integration = this.request.headers['x-pypestream-integration'];
    if (integration !== 'Genesys' || typeof base64Customer !== 'string') {
      return;
    }

    const customer: GenesysCustomer = getCustomer(base64Customer);
    this.customer = customer;

    if (process.env.NODE_ENV === 'test') {
      return;
    }
    this.genesysWebsocket
      .addConnection({
        grantType: customer.grantType,
        clientId: customer.clientId,
        clientSecret: customer.clientSecret,
        getTokenUrl: `${customer.oAuthUrl}/oauth/token`,
        instanceUrl: customer.instanceUrl,
        queueId: customer.OMQueueId,
      })
      .then(() => {
        // eslint-disable-next-line
        this.logger.log('Connected to Genesys websocket');
      })
      .catch((err) => {
        this.logger.warn(err.message);
      });
  }

  /**
   * @ignore
   */
  private async getAccessToken() {
    const reqBody = {
      grant_type: this.customer.grantType,
      client_id: this.customer.clientId,
      client_secret: this.customer.clientSecret,
    };
    const oAuthUrl = `${this.customer.oAuthUrl}/oauth/token`;
    const res = await this.httpService
      .post(oAuthUrl, qs.stringify(reqBody))
      .toPromise();
    return res.data.access_token;
  }

  /**
   * @ignore
   */
  private async getGenesysConversationId(messageId: string) {
    const token = await this.getAccessToken();
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    try {
      const domain = this.customer.instanceUrl;
      const url = `${domain}/api/v2/conversations/messages/${messageId}/details`;

      const res = await axios.get(url, { headers: headers });
      return res.data.conversationId;
    } catch (error) {
      return '';
    }
  }
  /**
   * @ignore
   */
  private getMessageRequestBody(message: CccMessage) {
    const clientMessageId = uuidv4();
    const res = {
      channel: {
        platform: 'Open',
        type: 'Private',
        messageId: clientMessageId,
        to: {
          id: this.customer.OMIntegrationId,
        },
        from: {
          id: message.conversationId,
          idType: 'Opaque',
          firstName: 'PS',
          lastName: 'User',
        },
        metadata: {
          customAttributes: {
            conversationId: message.conversationId,
            customerAccountId: 'x123',
            customerName: 'John Doe',
            customerEmail: 'test@test.com',
            customerPhoneNumber: '9123456789',
          },
        },
        time: new Date().toISOString(),
      },
      type: 'Text',
      text: message.message.value,
      direction: 'Inbound',
    };
    return res;
  }
  /**
   * @ignore
   */
  private getEndConversationRequestBody(conversationId: string) {
    const clientMessageId = uuidv4();
    const res = {
      channel: {
        platform: 'Open',
        type: 'Private',
        messageId: clientMessageId,
        to: {
          id: this.customer.OMIntegrationId,
        },
        from: {
          id: conversationId,
          idType: 'Opaque',
          firstName: 'PS',
          lastName: 'User',
        },
        metadata: {
          customAttributes: {
            conversationId: conversationId,
            customerAccountId: 'x123',
            customerName: 'John Doe',
            customerEmail: 'test@test.com',
            customerPhoneNumber: '9123456789',
          },
        },
        time: new Date().toISOString(),
      },
      type: 'Text',
      text: 'Automated message: User has left the chat',
      direction: 'Inbound',
    };
    return res;
  }
  /**
   * @ignore
   */
  private startConversationRequestBody(message: CccMessage) {
    const clientMessageId = uuidv4();
    const res = {
      channel: {
        platform: 'Open',
        type: 'Private',
        messageId: clientMessageId,
        to: {
          id: this.customer.OMIntegrationId,
        },
        from: {
          id: message.conversationId,
          idType: 'Opaque',
          firstName: 'PS',
          lastName: 'User',
        },
        metadata: {
          customAttributes: {
            conversationId: message.conversationId,
            customerAccountId: 'x123',
            customerName: 'John Doe',
            customerEmail: 'test@test.com',
            customerPhoneNumber: '9123456789',
          },
        },
        time: new Date().toISOString(),
      },
      type: 'Text',
      text: message.message.value,
      direction: 'Inbound',
    };
    return res;
  }

  /**
   * Send message to Genesys
   * @param message
   */
  async sendMessage(
    message: CccMessage,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const token = await this.getAccessToken();
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    const url = `${this.customer.instanceUrl}${inboundUrl}`;
    const res = this.httpService.post(
      url,
      this.getMessageRequestBody(message),
      { headers: headers },
    );

    return res.toPromise();
  }
  /**
   * End conversation
   * @param conversationId
   */
  async endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    const token = await this.getAccessToken();
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const domain = this.customer.instanceUrl;
    const messageSent = await this.httpService.post(
      `${domain}${inboundUrl}`,
      this.getEndConversationRequestBody(conversationId),
      config,
    );

    return messageSent.toPromise();
  }
  /**
   * Start new conversation with initial message
   * @param message
   * @param history pass history of end-user
   */
  async startConversation(
    message: CccMessage,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const token = await this.getAccessToken();

    const domain = this.customer.instanceUrl;
    const url = `${domain}${inboundUrl}`;
    const body = this.startConversationRequestBody(message);
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    return this.httpService.post(url, body, config).toPromise();
  }

  /**
   * Convert posted body to CCC message
   * @param body
   * @param params
   */
  mapToCccMessage(body: GenesysWebhookBody): CccMessage {
    const messageId = uuidv4();

    return {
      message: {
        value: body.text,
        type: MessageType.Text,
        id: messageId,
      },
      sender: {
        username: 'test-agent',
        // username: item.agentInfo.agentName,
      },
      conversationId: body.channel.to.id,
    };
  }

  /**
   * Determine if request body is new message from Agent
   * @param message
   */
  hasNewMessageAction(message: GenesysWebhookBody): boolean {
    return !!message.text;
  }

  /**
   * Determine if agent is available to receive new message
   * @param message
   */
  isAvailable(skill: string): boolean {
    return !!skill;
  }

  /**
   * Return estimated wait time in seconds
   * @param message
   */
  getWaitTime(_: any): any {
    this.getAccessToken().then((token) => {
      const headers = {
        Authorization: 'Bearer ' + token,
      };
      const domain = this.customer.instanceUrl;
      const url = `${domain}/api/v2/routing/queues/${this.customer.OMQueueId}/mediatypes/message/estimatedwaittime`;

      axios.get(url, { headers: headers }).then((response) => {
        return response.data.results[0].estimatedWaitTimeSeconds.toString();
      });
    });
  }

  escalate(): boolean {
    return true;
  }
}
