import {
  CccMessage,
  MessageType,
  SendMessageResponse,
} from './../common/types';
import { Service, AgentService } from '../common/interfaces';
import axios, { AxiosResponse } from 'axios';

import { v4 as uuidv4 } from 'uuid';
import { GenesysConfig, GenesysWebhookBody } from './types';
import { getCustomer } from '../common/utils/get-customer';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';
import { Request } from 'express';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Scope } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

/* eslint-disable */
const axiosRetry = require('axios-retry');
const qs = require('qs');
/* eslint-disable */

axiosRetry(axios, { retries: 3 });

@Injectable({ scope: Scope.REQUEST })
export class GenesysService
  implements
    Service<GenesysWebhookBody, GenesysWebhookBody, GenesysWebhookBody>,
    AgentService
{
  _genesysConfig: GenesysConfig;

  /**
   * @ignore
   */
  private _url: string;
  private _accessToken: string;
  private _oAuthUrl: string;
  private _clientId: string;
  private _clientSecret: string;
  private _grantType: string;
  private _OMIntegrationId: string;

  /**
   *  Constructor
   * @param genesysConfig
   */
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectMiddlewareApi() private readonly middlewareApi: MiddlewareApi,
    private httpService: HttpService,
  ) {
    const base64Customer = this.request.headers['x-pypestream-customer'];
    if (typeof base64Customer !== 'string') {
      return null;
    }
    const customer = getCustomer(base64Customer);
    this._genesysConfig = customer;
    if (customer.instanceUrl) {
      this._url = `${customer.instanceUrl}/api/v2/conversations/messages/inbound/open`;
    } else {
      this._url = '';
    }
    this._oAuthUrl = customer.oAuthUrl
      ? `${customer.oAuthUrl}/oauth/token`
      : '';
    this._clientId = customer.clientId ? customer.clientId : '';
    this._clientSecret = customer.clientSecret ? customer.clientSecret : '';
    this._grantType = customer.grantType ? customer.grantType : '';
    this._OMIntegrationId = customer.OMIntegrationId
      ? customer.OMIntegrationId
      : '';
  }

  /**
   * @ignore
   */
  private async getAccessToken() {
    if (this._accessToken) return this._accessToken;

    const reqBody = {
      grant_type: this._grantType,
      client_id: this._clientId,
      client_secret: this._clientSecret,
    };
    const res = await this.httpService
      .post(this._oAuthUrl, qs.stringify(reqBody))
      .toPromise();
    this._accessToken = res.data.access_token;
    return this._accessToken;
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
      const res = await axios.get(
        `${this._genesysConfig.instanceUrl}/api/v2/conversations/messages/${messageId}/details`,
        { headers: headers },
      );
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
          id: this._OMIntegrationId,
        },
        from: {
          id: message.conversationId,
          idType: 'Opaque',
          firstName: 'PS',
          lastName: 'User',
        },
        metadata: {
          customAttributes: {
            customerAccountId: 'x123',
            customerName: 'John Doe',
            customerEmailAddress: 'test@test.com',
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
          id: this._OMIntegrationId,
        },
        from: {
          id: conversationId,
          idType: 'Opaque',
          firstName: 'PS',
          lastName: 'User',
        },
        metadata: {
          customAttributes: {
            customerAccountId: 'x123',
            customerName: 'John Doe',
            customerEmailAddress: 'test@test.com',
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
          id: this._OMIntegrationId,
        },
        from: {
          id: message.conversationId,
          idType: 'Opaque',
          firstName: 'PS',
          lastName: 'User',
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
    if (!this._url) {
      throw new Error('Genesys.sendMessage instance-url must has value');
    }
    const token = await this.getAccessToken();
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    // console.log('MEssage: ', message)
    const res = this.httpService.post(
      this._url,
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
    if (!this._url) {
      throw new Error('Genesys.endConversation instance-url must has value');
    }
    const token = await this.getAccessToken();
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    const res = await axios.post(
      this._url,
      this.getEndConversationRequestBody(conversationId),
      { headers: headers },
    );

    const messageId = res.data.id;
    const genesysConversationId = await this.getGenesysConversationId(
      messageId,
    );
    if (!genesysConversationId) return res;

    return this.httpService
      .patch(
        `${this._genesysConfig.instanceUrl}/api/v2/conversations/chats/${genesysConversationId}`,
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
    if (!this._url) {
      throw new Error('Genesys.startConversation instance-url must has value');
    }
    const token = await this.getAccessToken();
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    // console.log('Message: ', message)
    return this.httpService
      .post(this._url, this.startConversationRequestBody(message), {
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
