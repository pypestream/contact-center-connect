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
import axios, { AxiosResponse } from 'axios';

import { v4 as uuidv4 } from 'uuid';
import { FlexWebhookBody, FlexCustomer } from './types';
import { getCustomer } from '../common/utils/get-customer';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';
import { Request } from 'express';
import { Inject } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Scope } from '@nestjs/common';
import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';

import { userLeftChatMessage } from '../common/messages-templates';
import { IntegrationName } from '../common/types/agent-services';

/* eslint-disable */
const axiosRetry = require('axios-retry');
const qs = require('qs');
/* eslint-disable */
const flexChannelUrl = 'https://flex-api.twilio.com/v1/Channels';
const chatServiceUrl = 'https://chat.twilio.com/v2/Services';
axiosRetry(axios, { retries: 3 });

@Injectable({ scope: Scope.REQUEST })
export class FlexService
  implements
    Service<FlexWebhookBody, FlexWebhookBody, FlexWebhookBody>,
    GenericWebhookInterpreter<FlexWebhookBody>,
    AgentService
{
  /**
   * @ignore
   */
  private customer: FlexCustomer;
  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectMiddlewareApi() private readonly middlewareApi: MiddlewareApi,
    private httpService: HttpService,
  ) {
    const base64Customer = this.request.headers['x-pypestream-customer'];

    const integration = this.request.headers['x-pypestream-integration'];
    if (
      integration !== IntegrationName.Flex ||
      typeof base64Customer !== 'string'
    ) {
      return null;
    }

    const customer: FlexCustomer = getCustomer(base64Customer);
    this.customer = customer;
  }

  /**
   * @ignore
   */
  private getMessageRequestBody(message: CccMessage) {
    const res = {
      Body: message.message.value,
      From: 'PS User',
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
  private startConversationRequestBody(message: CccMessage) {
    const res = {
      FlexFlowSid: this.customer.flexFlowSid,
      Identity: message.conversationId,
      ChatUserFriendlyName: 'PS User',
      ChatFriendlyName: 'PS User',
    };

    return res;
  }

  /**
   * Send message to Flex
   * @param message
   */
  async sendMessage(
    message: CccMessage,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const auth = {
      username: this.customer.accountSid,
      password: this.customer.authToken,
    };
    // console.log('MEssage: ', message)
    const url = `${chatServiceUrl}/${this.customer.serviceSid}/Channels/${message.conversationId}/Messages`;
    const res = this.httpService.post(
      url,
      qs.stringify(this.getMessageRequestBody(message)),
      { auth: auth },
    );

    return res.toPromise();
  }
  /**
   * End conversation
   * @param conversationId
   */
  async endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    const auth = {
      username: this.customer.accountSid,
      password: this.customer.authToken,
    };

    // Send message to notifiy agent
    const url = `${chatServiceUrl}/${this.customer.serviceSid}/Channels/${conversationId}/Messages`;
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
  ): Promise<AxiosResponse<StartConversationResponse>> {
    const auth = {
      username: this.customer.accountSid,
      password: this.customer.authToken,
    };

    // Create a channel to start conversation
    const res = await axios.post(
      flexChannelUrl,
      qs.stringify(this.startConversationRequestBody(message)),
      { auth: auth },
    );
    const channelId = res.data.sid;

    // Send chat history
    const url = `${chatServiceUrl}/${this.customer.serviceSid}/Channels/${channelId}/Messages`;
    this.httpService
      .post(url, qs.stringify(this.getMessageRequestBody(message)), {
        auth: auth,
      })
      .toPromise();

    // Update channel to use conversationID as unniqueName
    const reqUrl = `${chatServiceUrl}/${this.customer.serviceSid}/Channels/${channelId}`;

    const startConversationRes = await this.httpService
      .post(reqUrl, qs.stringify({ UniqueName: message.conversationId }), {
        auth: auth,
      })
      .toPromise();

    return {
      ...startConversationRes,
      data: {
        ...startConversationRes.data,
        escalationId: channelId,
      },
    };
  }

  /**
   * Convert posted body to CCC message
   * @param body
   * @param params
   */
  mapToCccMessage(body: FlexWebhookBody): CccMessage {
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
  getChatId(message: FlexWebhookBody): string {
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
  hasAgentRejectedChat(message: FlexWebhookBody): boolean {
    return (
      message.EventType === 'reservation.rejected' ||
      message.TaskReEvaluatedReason === 'reservation_rejected'
    );
  }

  /**
   * Determine if Agent has joined the chat
   * @param message
   */
  hasAgentJoinedChat(message: FlexWebhookBody): boolean {
    return message.EventType === 'reservation.accepted';
  }

  /**
   * Determine if Agent left the chat
   * @param message
   */
  hasAgentLeftChat(message: FlexWebhookBody): boolean {
    return message.EventType === 'reservation.wrapup';
  }

  /**
   * Determine if request body is new message from Agent
   * @param message
   */
  hasNewMessageAction(message: FlexWebhookBody): boolean {
    return message.Source === 'SDK' && !!message.Body;
  }

  /**
   * Determine if agent is available to receive new message
   * @param message
   */
  async isAvailable(skill: string): Promise<boolean> {
    const auth = {
      username: this.customer.accountSid,
      password: this.customer.authToken,
    };

    const url = `https://taskrouter.twilio.com/v1/Workspaces/${this.customer.workspaceSid}/Workers`;

    // Create a channel to start conversation
    const res = await axios.get(url, { auth: auth });
    return res.data.workers.some((worker) => worker.available);
  }

  escalate(): boolean {
    return true;
  }
}
