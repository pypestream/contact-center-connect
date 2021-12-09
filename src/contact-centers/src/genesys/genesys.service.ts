import {
  CccMessage,
  MessageType,
  SendMessageResponse,
} from './../common/types';
import { Service, AgentService } from '../common/interfaces';
import axios, { AxiosResponse } from 'axios';

import { v4 as uuidv4 } from 'uuid';
import { GenesysWebhookBody, GenesysCustomer } from './types';
import { getCustomer } from '../common/utils/get-customer';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';
import { Request } from 'express';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Scope } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { GenesysWebsocket } from './genesys.websocket';

/* eslint-disable */
const axiosRetry = require('axios-retry');
const qs = require('qs');
/* eslint-disable */
const inboundUrl = '/api/v2/conversations/messages/inbound/open';
axiosRetry(axios, { retries: 3 });

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

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectMiddlewareApi() private readonly middlewareApi: MiddlewareApi,
    private readonly genesysWebsocket: GenesysWebsocket,
    private httpService: HttpService,
  ) {
    const base64Customer = this.request.headers['x-pypestream-customer'];
    if (typeof base64Customer !== 'string') {
      return null;
    }
    const customer: GenesysCustomer = getCustomer(base64Customer);
    this.customer = customer;
    this.genesysWebsocket
      .addConnection({
        grantType: 'client_credentials',
        clientId: 'cee20b0f-1881-4b8e-bea1-4fa625ec0c72',
        clientSecret: '_pngpQy8CGpF69dVgOlnWZuCwRjGN1EjKqpv-GpAcYQ',
        getTokenUrl: 'https://login.usw2.pure.cloud/oauth/token',
        getChannelUrl:
          'https://api.usw2.pure.cloud/api/v2/notifications/channels',
        queueId: '0c54f616-50d6-43a0-9373-ecda0dc0f69b',
      })
      .then(() => {
        console.log('Connected');
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
      //console.log(error.response.status)
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
      text: 'Automated message: USER ENDED CHAT.',
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
    // console.log('MEssage: ', message)
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
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    const domain = this.customer.instanceUrl;
    const res = await axios.post(
      `${domain}${inboundUrl}`,
      this.getEndConversationRequestBody(conversationId),
      { headers: headers },
    );

    const messageId = res.data.id;

    // Wait few seconds for Genesys update conversation ID for the message:
    await new Promise((resolve) => setTimeout(resolve, 2000));
    const genesysConversationId = await this.getGenesysConversationId(
      messageId,
    );
    if (!genesysConversationId) return res;

    return this.httpService
      .patch(
        `${domain}/api/v2/conversations/chats/${genesysConversationId}`,
        { state: 'disconnected' },
        { headers: headers },
      )
      .toPromise();
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
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    // console.log('Message: ', message)
    const domain = this.customer.instanceUrl;
    const url = `${domain}${inboundUrl}`;
    return this.httpService
      .post(url, this.startConversationRequestBody(message), {
        headers: headers,
      })
      .toPromise();
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

  escalate(): boolean {
    return true;
  }
}
