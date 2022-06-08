import {
  CccMessage,
  MessageType,
  SendMessageResponse,
  StartConversationResponse,
} from './../common/types';
import {
  Service,
  GenericWebhookInterpreter,
  AgentService,
} from '../common/interfaces';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { v4 as uuidv4 } from 'uuid';
import { LivePersonWebhookBody, LivePersonCustomer } from './types';
import { getCustomer } from '../common/utils/get-customer';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import { Request } from 'express';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Scope } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { userLeftChatMessage } from '../common/messages-templates';
import { IntegrationName } from '../common/types/agent-services';
import { publicComponents } from '../middleware-api/types';

/* eslint-disable */
const axiosRetry = require('axios-retry');
const qs = require('qs');
/* eslint-disable */
const flexChannelUrl = 'https://flex-api.twilio.com/v1/Channels';
const chatServiceUrl = 'https://chat.twilio.com/v2/Services';
axiosRetry(axios, { retries: 3 });

@Injectable({ scope: Scope.REQUEST })
export class LivePersonService
  implements
    Service<
      LivePersonWebhookBody,
      LivePersonWebhookBody,
      LivePersonWebhookBody
    >,
    GenericWebhookInterpreter<LivePersonWebhookBody>,
    AgentService
{
  /**
   * @ignore
   */
  private customer: LivePersonCustomer;
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectMiddlewareApi() private readonly middlewareApi: MiddlewareApi,
    private httpService: HttpService,
    private readonly middlewareApiService: MiddlewareApiService,
  ) {
    const base64Customer = this.request.headers['x-pypestream-customer'];

    const integration = this.request.headers['x-pypestream-integration'];
    if (
      integration !== IntegrationName.LivePerson ||
      typeof base64Customer !== 'string'
    ) {
      return null;
    }

    const customer: LivePersonCustomer = getCustomer(base64Customer);
    this.customer = customer;
  }

  /**
   * @ignore
   */
  private async getTokens() {
    // Get AppJWT
    const sentinelUrl = `https://${this.customer.sentinelBaseUri}/sentinel/api/account/${this.customer.accountNumber}/app/token?v=1.0&grant_type=client_credentials`;
    const reqBody = {
      client_id: this.customer.clientId,
      client_secret: this.customer.clientSecret,
    };

    const res = await this.httpService
      .post(sentinelUrl, qs.stringify(reqBody))
      .toPromise();
    const access_token = res.data.access_token;

    // Get ConsumerJWT
    const idpUrl = `https://${this.customer.idpBaseUri}/api/account/${this.customer.accountNumber}/consumer?v=1.0`;
    const config: AxiosRequestConfig = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: access_token,
      },
    };
    const reqBody2 = {
      ext_consumer_id: 'pypestream' + uuidv4(),
    };
    const res2 = await this.httpService
      .post(idpUrl, reqBody2, config)
      .toPromise();

    const token = res2.data.token;

    return [access_token, token];
  }

  /**
   * @ignore
   */
  private getMessageRequestBody(message: CccMessage, livePersonConvId: string) {
    const res = {
      kind: 'req',
      id: '1',
      type: 'ms.PublishEvent',
      body: {
        dialogId: livePersonConvId,
        event: {
          type: 'ContentEvent',
          contentType: 'text/plain',
          message: message.message.value,
        },
      },
    };
    return res;
  }
  /**
   * @ignore
   */
  private getEndConversationRequestBody() {
    const res = {
      Body: userLeftChatMessage,
      From: 'PS User',
    };
    return res;
  }
  /**
   * @ignore
   */
  private startConversationRequestBody(
    message: CccMessage,
    metadata?: publicComponents['schemas']['Metadata'],
  ) {
    const res = [
      {
        kind: 'req',
        id: '1,',
        type: 'userprofile.SetUserProfile',
        body: {
          authenticatedData: {
            lp_sdes: [
              {
                type: 'personal',
                personal: {
                  firstname: metadata.bot.first_name || 'PS',
                  lastname: metadata.bot.last_name || 'User',
                  contacts: [
                    {
                      email: metadata.bot.email || '',
                      phone: metadata.bot.phone || '',
                    },
                  ],
                },
              },
            ],
          },
        },
      },
      {
        kind: 'req',
        id: '2,',
        type: 'cm.ConsumerRequestConversation',
        body: {
          brandId: this.customer.accountNumber,
        },
      },
    ];
    console.log('req body: ', JSON.stringify(res));
    return res;
  }

  /**
   * Send message to LivePerson
   * @param message
   */
  async sendMessage(
    message: CccMessage,
    metadata?: publicComponents['schemas']['Metadata'],
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const accessToken = metadata.agent.accessToken as string;
    const token = metadata.agent.token as string;
    const livePersonConversationId = metadata.agent
      .livePersionConversationId as string;
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: accessToken,
        'X-LP-ON-BEHALF': token,
        'Content-Type': 'application/json',
      },
    };
    const url = `https://${this.customer.asyncMessagingEntBaseUri}/api/account/${this.customer.accountNumber}/messaging/consumer/conversation/send?v=3`;

    return this.httpService
      .post(
        url,
        this.getMessageRequestBody(message, livePersonConversationId),
        config,
      )
      .toPromise();
  }
  /**
   * End conversation
   * @param conversationId
   */
  async endConversation(
    conversationId: string,
    metadata?,
  ): Promise<AxiosResponse<any>> {
    const auth = {
      username: 'this.customer.accountSid',
      password: 'this.customer.authToken',
    };

    // Send message to notifiy agent
    const url = `${chatServiceUrl}/${'this.customer.serviceSid'}/Channels/${conversationId}/Messages`;
    return this.httpService
      .post(url, qs.stringify(this.getEndConversationRequestBody()), {
        auth: auth,
      })
      .toPromise();
  }
  /**
   * Start new conversation with initial message
   * @param message
   * @param history pass history of end-user
   */
  async startConversation(
    message: CccMessage,
    metadata?: publicComponents['schemas']['Metadata'],
  ): Promise<AxiosResponse<StartConversationResponse>> {
    const [accessToken, token] = await this.getTokens();
    const url = `https://${this.customer.asyncMessagingEntBaseUri}/api/account/${this.customer.accountNumber}/messaging/consumer/conversation?v=3`;
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: accessToken,
        'X-LP-ON-BEHALF': token,
        'Content-Type': 'application/json',
      },
    };
    const res = await this.httpService
      .post(url, this.startConversationRequestBody(message, metadata), config)
      .toPromise();

    const livePersionConversationId = res.data[1].body.conversationId;
    this.middlewareApiService.updateAgentMetadata(message.conversationId, {
      accessToken: accessToken,
      token: token,
      livePersonConversationId: livePersionConversationId,
    });
    return {
      ...res,
      data: {
        ...res.data,
        escalationId: livePersionConversationId,
      },
    };
  }

  /**
   * Convert posted body to CCC message
   * @param body
   * @param params
   */
  mapToCccMessage(body: LivePersonWebhookBody): CccMessage {
    const messageId = uuidv4();

    return {
      message: {
        value: body.Body,
        type: MessageType.Text,
        id: messageId,
      },
      sender: {
        username: 'test-agent',
        // username: item.agentInfo.agentName,
      },
      conversationId: uuidv4(),
    };
  }

  /**
   * Get chat ID
   * @param message
   */
  getChatId(message: LivePersonWebhookBody): string {
    if (message.ChannelSid) return message.ChannelSid;
    if (message.TaskAttributes) {
      const attributes = JSON.parse(message.TaskAttributes);
      return attributes.channelSid;
    }
    return null;
  }

  /**
   * Determine if Agent reject the chat
   * @param message
   */
  hasAgentRejectedChat(message: LivePersonWebhookBody): boolean {
    return (
      message.EventType === 'reservation.rejected' ||
      message.TaskReEvaluatedReason === 'reservation_rejected'
    );
  }

  /**
   * Determine if Agent has joined the chat
   * @param message
   */
  hasAgentJoinedChat(message: LivePersonWebhookBody): boolean {
    return message.EventType === 'reservation.accepted';
  }

  /**
   * Determine if Agent left the chat
   * @param message
   */
  hasAgentLeftChat(message: LivePersonWebhookBody): boolean {
    return message.EventType === 'reservation.wrapup';
  }

  /**
   * Determine if request body is new message from Agent
   * @param message
   */
  hasNewMessageAction(message: LivePersonWebhookBody): boolean {
    return message.Source === 'SDK' && !!message.Body;
  }

  /**
   * Determine if agent is available to receive new message
   * @param message
   */
  async isAvailable(skill: string): Promise<boolean> {
    return true;
  }

  escalate(): boolean {
    return true;
  }
}
