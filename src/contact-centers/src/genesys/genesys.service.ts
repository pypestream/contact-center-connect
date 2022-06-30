import {
  CccMessage,
  MessageType,
  SendMessageResponse,
  StartConversationResponse,
} from './../common/types';
import {
  OnQueueMetric,
  QueryObservationsResponse,
} from './types/query-observations-response';
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
import { Scope } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { GenesysWebsocket } from './genesys.websocket';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';

import { userLeftChatMessage } from '../common/messages-templates';
import { IntegrationName } from '../common/types/agent-services';
import { publicComponents } from '../middleware-api/types';

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
    private readonly middlewareApiService: MiddlewareApiService,
  ) {
    const base64Customer = this.request.headers['x-pypestream-customer'];
    const integration = this.request.headers['x-pypestream-integration'];
    if (
      integration !== IntegrationName.Genesys ||
      typeof base64Customer !== 'string'
    ) {
      return;
    }

    const customer: GenesysCustomer = getCustomer(base64Customer);
    this.customer = customer;

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

  private async isIdleAgentOnQueues(): Promise<boolean> {
    const token = await this.getAccessToken();
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    const domain = this.customer.instanceUrl;
    const url = `${domain}/api/v2/analytics/queues/observations/query`;
    const reqBody = {
      filter: {
        type: 'or',
        clauses: [
          {
            type: 'or',
            predicates: [
              {
                type: 'dimension',
                dimension: 'queueId',
                operator: 'matches',
                value: this.customer.OMQueueId,
              },
            ],
          },
        ],
      },
      metrics: ['oOnQueueUsers'],
    };
    const res = await axios.post<QueryObservationsResponse>(url, reqBody, {
      headers: headers,
    });

    return res.data?.results?.[0].data?.some((item: OnQueueMetric) =>
      ['IDLE', 'INTERACTING'].includes(item.qualifier),
    );
  }

  /**
   * @ignore
   */
  private getMetadataAttributes(
    message: CccMessage,
    metadata: publicComponents['schemas']['Metadata'],
  ) {
    let metadataAttributes = {
      conversationId: message.conversationId,
    };
    if (metadata) {
      const extra_data = metadata.bot.extra_data as Object;
      metadataAttributes = { ...metadataAttributes, ...extra_data };
    }
    return metadataAttributes;
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
      text: userLeftChatMessage,
      direction: 'Inbound',
    };
    return res;
  }
  /**
   * @ignore
   */
  private startConversationRequestBody(
    message: CccMessage,
    metadata: publicComponents['schemas']['Metadata'],
  ) {
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
          firstName: metadata.bot.first_name || 'Pypestream',
          lastName: metadata.bot.last_name || 'User',
        },
        metadata: {
          customAttributes: this.getMetadataAttributes(message, metadata),
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
    metadata: publicComponents['schemas']['Metadata'],
  ): Promise<AxiosResponse<StartConversationResponse>> {
    const token = await this.getAccessToken();

    const domain = this.customer.instanceUrl;
    const url = `${domain}${inboundUrl}`;
    const body = this.startConversationRequestBody(message, metadata);
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const res = await this.httpService.post(url, body, config).toPromise();
    console.log(
      'res.data.channel.id',
      res.data.channel.id,
      'message.conversationId',
      message.conversationId,
    );
    return {
      ...res,
      data: {
        message: res.data.message,
        escalationId: message.conversationId,
      },
    };
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
  async isAvailable(skill: string): Promise<boolean> {
    return await this.isIdleAgentOnQueues();
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
