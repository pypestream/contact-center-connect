import {
  CccMessage,
  MessageType,
  SendMessageResponse,
} from './../common/types';
import {
  Service,
  GenericWebhookInterpreter,
  AgentService,
} from '../common/interfaces';
import axios, { AxiosResponse } from 'axios';

import { v4 as uuidv4 } from 'uuid';
import { FreshChatWebhookBody, FreshChatConfig } from './types';
import { Inject, Injectable } from '@nestjs/common';
import { Scope } from '@nestjs/common';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { getCustomer } from '../common/utils/get-customer';
import { HttpService } from '@nestjs/axios';

// eslint-disable-next-line
const axiosRetry = require('axios-retry');

axiosRetry(axios, { retries: 3 });

const conversationId = '';

@Injectable({
  scope: Scope.REQUEST,
})
export class FreshChatService
  implements
    Service<FreshChatWebhookBody, FreshChatWebhookBody, FreshChatWebhookBody>,
    GenericWebhookInterpreter<FreshChatWebhookBody>,
    AgentService
{
  freshChatConfig: FreshChatConfig;

  /**
   * @ignore
   */
  url: string;

  /**
   *  Constructor
   * @param cccConfig
   * @param freshChatConfig
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
    this.freshChatConfig = {
      ...customer,
      ...this.middlewareApi.config,
    };

    this.url = `https://api.freshchat.com`;
  }

  /**
   * @ignore
   */
  private getMessageRequestBody(message: CccMessage) {
    const requestId = uuidv4();
    return {
      requestId,
      clientSessionId: message.conversationId,
      contextVariables: {
        LiveAgent_mandatory_skills: message.skill,
      },
      message: {
        text: message.message.value,
        typed: true,
        clientMessageId: message.message.id,
      },
      userId: message.conversationId,
      clientVariables: this.freshChatConfig,
    };
  }
  /**
   * @ignore
   */
  private getEndConversationRequestBody() {
    const res = { status: 'resolved' };
    return res;
  }
  /**
   * @ignore
   */
  private startConversationRequestBody(message: CccMessage) {
    const res = {
      app_id: 'c69641e9-8a85-4da1-858e-77169b0c76a7',
      channel_id: '1cd211c4-83f7-4292-b89f-8b768669e208',
      messages: [
        {
          app_id: 'c69641e9-8a85-4da1-858e-77169b0c76a7',
          actor_type: 'user',
          actor_id: 'a899325a-5b9e-4de9-86de-11b3b6cb3f1a',
          channel_id: '1cd211c4-83f7-4292-b89f-8b768669e208',
          message_type: 'normal',
          message_parts: [
            {
              text: {
                content: message.message.value,
              },
            },
          ],
        },
      ],
      status: 'new',
      users: [{ id: 'a899325a-5b9e-4de9-86de-11b3b6cb3f1a' }],
    };
    return res;
  }

  /**
   * Send message to FreshChat
   * @param message
   */
  sendMessage(
    message: CccMessage,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (!this.freshChatConfig.apiToken) {
      throw new Error('FreshChat.sendMessage api-token must has value');
    }
    const url = `${this.url}/v2/conversations/${conversationId}/messages`;
    const authorizationHeader = `Bearer ${this.freshChatConfig.apiToken}`;
    const res = this.httpService.post(
      url,
      this.getMessageRequestBody(message),
      {
        headers: {
          Authorization: authorizationHeader,
        },
      },
    );

    return res.toPromise();
  }
  /**
   * End conversation
   * @param conversationId
   */
  endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    if (!this.freshChatConfig.apiToken) {
      throw new Error('FreshChat.endConversation apiToken must has value');
    }

    const route = `/v2/conversations/${conversationId}`;
    const url = `${this.url}${route}`;
    const res = this.httpService.post(
      url,
      this.getEndConversationRequestBody(),
    );

    return res.toPromise();
  }
  /**
   * Start new conversation with initial message
   * @param message
   * @param history pass history of end-user
   */
  async startConversation(
    message: CccMessage,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (!this.freshChatConfig.apiToken) {
      throw new Error('FreshChat.startConversation api-token must has value');
    }

    const authorizationHeader = `Bearer ${this.freshChatConfig.apiToken}`;
    const url = `${this.url}/v2/conversations`;
    const startConversation = this.httpService.post(
      url,
      this.startConversationRequestBody(message),
      {
        headers: {
          Authorization: authorizationHeader,
        },
      },
    );

    return startConversation.toPromise();
  }

  /**
   * Update Typing indicator in agent side
   * @param message
   */

  sendTyping(
    conversationId: string,
    isTyping: boolean,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    throw new Error(
      'FreshChat.sendTyping conversationId param is required parameter',
    );
  }

  /**
   * Convert posted body to CCC message
   * @param body
   * @param params
   */
  mapToCccMessage(
    body: FreshChatWebhookBody,
    params?: { index: number },
  ): CccMessage {
    const messageId = uuidv4();
    const value = body.data.message.message_parts
      .map((mp) => mp.text)
      .join('/n');

    return {
      message: {
        value: value,
        type: MessageType.Text,
        id: messageId,
      },
      sender: {
        username: 'test-agent',
        // username: item.agentInfo.agentName,
      },
      conversationId: body.data.message.conversation_id,
      clientVariables: this.freshChatConfig,
    };
  }

  /**
   * Determine if request body has `new message` action
   * @param message
   */
  hasNewMessageAction(message: FreshChatWebhookBody): boolean {
    const res = message.action === 'message_create';
    return res;
  }

  /**
   * Determine if request body has `end conversation` action
   * @param message
   */
  hasEndConversationAction(message: FreshChatWebhookBody): boolean {
    const item = message.data.message.message_type === 'end_conversation';
    return !!item;
  }

  /**
   * Determine if request body has `typing indicator` action
   * @param message
   */
  hasTypingIndicatorAction(message: FreshChatWebhookBody): boolean {
    return false;
  }
  /**
   * Determine if agent is typing or viewing based on request body
   * @param message
   */
  isTyping(message: FreshChatWebhookBody): boolean {
    return false;
  }
  /**
   * Determine if agent is available to receive new message
   * @param message
   */
  isAvailable(skill: string): boolean {
    return !!skill;
  }

  /**
   * Determine if request body has `wait time` info
   * @param message
   */
  hasWaitTime(message: FreshChatWebhookBody): boolean {
    return false;
  }

  /**
   * Return estimated wait time in seconds
   * @param message
   */
  getWaitTime(message: FreshChatWebhookBody): string {
    throw new Error('FreshChat.getWaitTime is not implemented ');
  }

  escalate(): boolean {
    return true;
  }
}
