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
import {
  ServiceNowWebhookBody,
  StartTypingIndicatorType,
  EndTypingIndicatorType,
  StartWaitTimeSpinnerType,
  ServiceNowConfig,
  OutputTextType,
  ActionSystemType,
} from './types';
import { Inject, Injectable } from '@nestjs/common';
import { Scope } from '@nestjs/common';
import * as sleep from 'sleep-promise';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';
import { getCustomer } from '../common/utils/get-customer';
import { HttpService } from '@nestjs/axios';
import { publicComponents } from '../middleware-api/types';

@Injectable({
  scope: Scope.REQUEST,
})
export class ServiceNowService
  implements
    Service<
      ServiceNowWebhookBody,
      ServiceNowWebhookBody,
      ServiceNowWebhookBody
    >,
    GenericWebhookInterpreter<ServiceNowWebhookBody>,
    AgentService
{
  serviceNowConfig: ServiceNowConfig;

  /**
   * @ignore
   */
  url: string;

  /**
   *  Constructor
   * @param cccConfig
   * @param serviceNowConfig
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
    this.serviceNowConfig = {
      ...customer,
      ...this.middlewareApi.config,
    };

    if (this.serviceNowConfig.instanceUrl) {
      this.url = `${this.serviceNowConfig.instanceUrl}/api/sn_va_as_service/bot/integration`;
    } else {
      this.url = '';
    }
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
      clientVariables: this.serviceNowConfig,
    };
  }
  /**
   * @ignore
   */
  private getEndConversationRequestBody(conversationId: string) {
    const res = {
      clientSessionId: conversationId,
      action: 'END_CONVERSATION',
      message: {
        text: '',
        typed: true,
      },
      userId: conversationId,
      clientVariables: this.serviceNowConfig,
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
    const requestId = uuidv4();
    const clientMessageId = uuidv4();
    const res = {
      requestId,
      clientSessionId: message.conversationId,
      action: 'AGENT',
      contextVariables: {
        LiveAgent_mandatory_skills: message.skill,
        liveagent_deviceType: metadata.user.platform,
        language: metadata.user.browser_language,
      },
      message: {
        text: message.message.value,
        typed: true,
        clientMessageId,
      },
      userId: this.getUserName(metadata),
      emailId: metadata.bot.email,
      clientVariables: this.serviceNowConfig,
    };
    // eslint-disable-next-line
    console.log('metadata: ', JSON.stringify(metadata));
    // eslint-disable-next-line
    console.log('send to servicenow: ', JSON.stringify(res));
    return res;
  }
  /**
   * @ignore
   */
  private getUserName(metadata: publicComponents['schemas']['Metadata']) {
    const firstName =
      metadata.user.first_name || metadata.bot.first_name || 'Pypestream';
    const lastName =
      metadata.user.last_name || metadata.bot.last_name || 'User';
    return `${firstName}.${lastName}`;
  }
  /**
   * @ignore
   */
  private switchToAgentRequestBody(
    message: CccMessage,
    metadata: publicComponents['schemas']['Metadata'],
  ) {
    const requestId = uuidv4();
    const res = {
      requestId,
      clientSessionId: message.conversationId,
      action: 'AGENT',
      contextVariables: {
        LiveAgent_mandatory_skills: message.skill,
        liveagent_deviceType: metadata.user.platform,
        language: metadata.user.browser_language,
      },
      message: {
        text: 'Switch to live agent',
        typed: true,
        clientMessageId: message.message.id,
      },
      userId: this.getUserName(metadata),
      emailId: metadata.bot.email,
      clientVariables: this.serviceNowConfig,
    };
    return res;
  }
  /**
   * Send message to ServiceNow
   * @param message
   */
  sendMessage(
    message: CccMessage,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (!this.serviceNowConfig.instanceUrl) {
      throw new Error('Servicenow.sendMessage instance-url must has value');
    }
    const res = this.httpService.post(
      this.url,
      this.getMessageRequestBody(message),
    );

    return res.toPromise();
  }
  /**
   * End conversation
   * @param conversationId
   */
  endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    if (!this.serviceNowConfig.instanceUrl) {
      throw new Error('Servicenow.endConversation instance-url must has value');
    }

    const res = this.httpService.post(
      this.url,
      this.getEndConversationRequestBody(conversationId),
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
    metadata: publicComponents['schemas']['Metadata'],
  ): Promise<AxiosResponse<StartConversationResponse>> {
    if (!this.serviceNowConfig.instanceUrl) {
      throw new Error(
        'Servicenow.startConversation instance-url must has value',
      );
    }

    const startConversation = this.httpService.post(
      this.url,
      this.startConversationRequestBody(message, metadata),
    );
    await startConversation.toPromise();
    await sleep(3000);
    const res = await this.httpService
      .post(this.url, this.switchToAgentRequestBody(message, metadata))
      .toPromise();
    return {
      ...res,
      data: {
        ...res.data,
        escalationId: uuidv4(),
      },
    };
  }

  /**
   * @ignore
   */
  private getTypingRequestBody(conversationId: string, isTyping: boolean) {
    const requestId = uuidv4();

    const res = {
      requestId,
      clientSessionId: conversationId,
      action: isTyping ? 'TYPING' : 'VIEWING',
      userId: conversationId,
    };
    return res;
  }
  /**
   * @ignore
   */
  private getEndRequestBody(conversationId: string) {
    const requestId = uuidv4();

    const res = {
      requestId,
      clientSessionId: conversationId,
      action: 'END_CONVERSATION',
    };
    return res;
  }

  /**
   * Update Typing indicator in agent side
   * @param message
   */

  sendTyping(
    conversationId: string,
    isTyping: boolean,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (!this.serviceNowConfig.instanceUrl) {
      throw new Error('Servicenow.sendTyping instance-url must has value');
    }

    if (!conversationId) {
      throw new Error(
        'ServiceNow.sendTyping conversationId param is required parameter',
      );
    }

    const res = this.httpService.post(
      this.url,
      this.getTypingRequestBody(conversationId, isTyping),
    );

    return res.toPromise();
  }

  /**
   * Convert posted body to CCC message
   * @param body
   * @param params
   */
  mapToCccMessage(
    body: ServiceNowWebhookBody,
    params: { index: number },
  ): CccMessage {
    const messageId = uuidv4();
    const { index } = params;
    const item = body.body[index];

    let value: string;

    if (item.uiType === 'OutputText') {
      value = (item as unknown as OutputTextType).value;
    } else if (
      item.uiType === 'ActionMsg' &&
      (item as unknown as ActionSystemType).actionType === 'System'
    ) {
      value = (item as unknown as ActionSystemType).message;
    } else if (
      item.uiType === 'ActionMsg' &&
      (item as unknown as StartWaitTimeSpinnerType).actionType ===
        'StartSpinner'
    ) {
      value = (item as unknown as StartWaitTimeSpinnerType).message;
    } else {
      return;
    }
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
      conversationId: body.clientSessionId,
      clientVariables: this.serviceNowConfig,
    };
  }

  /**
   * Determine if request body has `new message` action
   * @param message
   */
  hasNewMessageAction(message: ServiceNowWebhookBody): boolean {
    const item = message.body.find(
      (item) =>
        (item.uiType === 'OutputText' && item.group === 'DefaultText') ||
        (item.uiType === 'ActionMsg' && item.actionType === 'System'),
    );
    return !!item;
  }

  /**
   * Determine if request body has `end conversation` action
   * @param message
   */
  hasEndConversationAction(message: ServiceNowWebhookBody): boolean {
    const item = message.body.find(
      (item) =>
        item.uiType === 'ActionMsg' &&
        item.actionType === 'System' &&
        item.message.includes('has closed the support session'),
    );
    return !!item;
  }

  /**
   * Determine if request body has `agent accepted escalation` action
   * @param message
   */
  hasAcceptedEscalationAction(message: ServiceNowWebhookBody): boolean {
    const item = message.body.find(
      (item) =>
        item.uiType === 'ActionMsg' && item.actionType === 'SwitchToLiveAgent',
    );
    return !!item;
  }

  /**
   * Determine if request body has `typing indicator` action
   * @param message
   */
  hasTypingIndicatorAction(message: ServiceNowWebhookBody): boolean {
    const item = message.body.some(
      (item: EndTypingIndicatorType | StartTypingIndicatorType) => {
        const isTypingIndicator =
          item.actionType === 'EndTypingIndicator' ||
          item.actionType === 'StartTypingIndicator';
        return item.uiType === 'ActionMsg' && isTypingIndicator;
      },
    );
    return !!item;
  }
  /**
   * Determine if agent is typing or viewing based on request body
   * @param message
   */
  isTyping(message: ServiceNowWebhookBody): boolean {
    type TypingIndicatorType =
      | EndTypingIndicatorType
      | StartTypingIndicatorType;
    const item = message.body.find((item: TypingIndicatorType) => {
      const isTypingIndicator =
        item.actionType === 'EndTypingIndicator' ||
        item.actionType === 'StartTypingIndicator';
      return item.uiType === 'ActionMsg' && isTypingIndicator;
    });
    return (item as TypingIndicatorType).actionType === 'StartTypingIndicator';
  }
  /**
   * Determine if agent is available to receive new message
   * @param message
   */
  isAvailable(skill: string): Promise<boolean> {
    return Promise.resolve(!!skill);
  }

  /**
   * Determine if request body has `wait time` info
   * @param message
   */
  hasWaitTime(message: ServiceNowWebhookBody): boolean {
    const item: StartWaitTimeSpinnerType = message.body.find((item) => {
      const spinner = item as StartWaitTimeSpinnerType;
      return spinner.spinnerType === 'wait_time';
    }) as StartWaitTimeSpinnerType;
    return !!item;
  }

  /**
   * Return estimated wait time in seconds
   * @param message
   */
  getWaitTime(message: ServiceNowWebhookBody): string {
    const item: StartWaitTimeSpinnerType = message.body.find((item) => {
      const spinner = item as StartWaitTimeSpinnerType;
      return spinner.spinnerType === 'wait_time';
    }) as StartWaitTimeSpinnerType;
    return item.waitTime;
  }

  escalate(): boolean {
    return true;
  }
}
