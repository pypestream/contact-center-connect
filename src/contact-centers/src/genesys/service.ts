import {
  CccMessage,
  EndUserServices,
  MessageType,
  SendMessageResponse,
  GenesysConfig,
} from './../common/types';
import {
  Service,
  GenericWebhookInterpreter,
  AgentService,
} from '../common/interfaces';
import axios, { AxiosResponse } from 'axios';

import { v4 as uuidv4 } from 'uuid';
import {
  GenesysWebhookBody,
  StartTypingIndicatorType,
  EndTypingIndicatorType,
  StartWaitTimeSpinnerType,
} from './types';
import { MiddlewareApiService } from '../middleware-api/service';

// eslint-disable-next-line
const axiosRetry = require('axios-retry');

axiosRetry(axios, { retries: 3 });

export class GenesysService
  implements
    Service<GenesysWebhookBody, GenesysWebhookBody, GenesysWebhookBody>,
    GenericWebhookInterpreter<GenesysWebhookBody>,
    AgentService
{
  GenesysConfig: GenesysConfig;

  /**
   * @ignore
   */
  url: string;
  private _accessToken: string;
  private _oAuthUrl: string;
  private _clientId: string;
  private _clientSecret: string;
  private _grantType: string;
  private _OMIntegrationId: string;

  /**
   *  Constructor
   * @param cccConfig
   * @param GenesysConfig
   */
  constructor(GenesysConfig: GenesysConfig = {}) {
    this.GenesysConfig = GenesysConfig;
    if (GenesysConfig.instanceUrl) {
      this.url = `${GenesysConfig.instanceUrl}/api/v2/conversations/messages/inbound/open`;
    } else {
      this.url = '';
    }
    this._oAuthUrl = GenesysConfig.oAuthUrl
      ? `${GenesysConfig.oAuthUrl}/oauth/token`
      : '';
    this._clientId = GenesysConfig.clientId ? GenesysConfig.clientId : '';
    this._clientSecret = GenesysConfig.clientSecret
      ? GenesysConfig.clientSecret
      : '';
    this._grantType = GenesysConfig.grantType ? GenesysConfig.grantType : '';
    this._OMIntegrationId = GenesysConfig.OMIntegrationId
      ? GenesysConfig.OMIntegrationId
      : '';
  }

  /**
   * @ignore
   */
  private async getAccessToken() {
    if (this._accessToken) return this._accessToken;

    // eslint-disable-next-line
    const qs = require('qs');
    const reqBody = {
      grant_type: this._grantType,
      client_id: this._clientId,
      client_secret: this._clientSecret,
    };
    const res = await axios.post(this._oAuthUrl, qs.stringify(reqBody));
    this._accessToken = res.data.access_token;
    return this._accessToken;
  }
  /**
   * @ignore
   */
  private getMessageRequestBody(message: CccMessage) {
    const requestId = uuidv4();
    const res = {
      channel: {
        platform: 'Open',
        type: 'Private',
        messageId: requestId,
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
      clientVariables: this.GenesysConfig,
    };
    return res;
  }
  /**
   * @ignore
   */
  private startConversationRequestBody(message: CccMessage) {
    const requestId = uuidv4();
    const clientMessageId = uuidv4();
    const res = {
      channel: {
        platform: 'Open',
        type: 'Private',
        messageId: requestId,
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
      text: message.message.value + message.conversationId,
      direction: 'Inbound',
    };
    return res;
  }
  /**
   * @ignore
   */
  private switchToAgentRequestBody(message: CccMessage) {
    const requestId = uuidv4();
    const res = {
      requestId,
      clientSessionId: message.conversationId,
      action: 'AGENT',
      contextVariables: {
        LiveAgent_mandatory_skills: message.skill,
      },
      message: {
        text: 'Switch to live agent',
        typed: true,
        clientMessageId: message.message.id,
      },
      userId: message.conversationId,
      clientVariables: this.GenesysConfig,
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
    if (!this.GenesysConfig.instanceUrl) {
      throw new Error('Genesys.sendMessage instance-url must has value');
    }
    const token = await this.getAccessToken();
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    // console.log('MEssage: ', message)
    const res = await axios.post(
      this.url,
      this.getMessageRequestBody(message),
      { headers: headers },
    );

    return res;
  }
  /**
   * End conversation
   * @param conversationId
   */
  async endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    if (!this.GenesysConfig.instanceUrl) {
      throw new Error('Genesys.endConversation instance-url must has value');
    }

    const res = await axios.post(
      this.url,
      this.getEndConversationRequestBody(conversationId),
    );

    return res;
  }
  /**
   * Start new conversation with initial message
   * @param message
   * @param history pass history of end-user
   */
  async startConversation(
    message: CccMessage,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (!this.GenesysConfig.instanceUrl) {
      throw new Error('Genesys.startConversation instance-url must has value');
    }
    const token = await this.getAccessToken();
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    // console.log('Message: ', message)
    return await axios.post(
      this.url,
      this.startConversationRequestBody(message),
      { headers: headers },
    );
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

  async sendTyping(
    conversationId: string,
    isTyping: boolean,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (!this.GenesysConfig.instanceUrl) {
      throw new Error('Genesys.sendTyping instance-url must has value');
    }

    if (!conversationId) {
      throw new Error(
        'Genesys.sendTyping conversationId param is required parameter',
      );
    }

    const res = await axios.post(
      this.url,
      this.getTypingRequestBody(conversationId, isTyping),
    );

    return res;
  }

  getEndUserService(body): EndUserServices {
    const configs = body.clientVariables;
    if (!configs) {
      return null;
    }
    const service = new MiddlewareApiService({
      url: configs.middlewareApiUrl,
      token: configs.token,
    });
    return service;
  }

  /**
   * Convert posted body to CCC message
   * @param body
   * @param params
   */
  mapToCccMessage(
    body: GenesysWebhookBody,
    params: { index: number },
  ): CccMessage {
    const messageId = uuidv4();
    const { index } = params;
    const item = body.body[index];
    if (item.uiType !== 'OutputText') {
      return;
    }
    return {
      message: {
        value: item.value,
        type: MessageType.Text,
        id: messageId,
      },
      sender: {
        username: 'test-agent',
        // username: item.agentInfo.agentName,
      },
      conversationId: body.clientSessionId,
      clientVariables: this.GenesysConfig,
    };
  }

  /**
   * Determine if request body has `new message` action
   * @param message
   */
  hasNewMessageAction(message: GenesysWebhookBody): boolean {
    const item = message.body.find(
      (item) => item.uiType === 'OutputText' && item.group === 'DefaultText',
    );
    return !!item;
  }

  /**
   * Determine if request body has `end conversation` action
   * @param message
   */
  hasEndConversationAction(message: GenesysWebhookBody): boolean {
    const item = message.body.find(
      (item) =>
        item.uiType === 'ActionMsg' &&
        item.actionType === 'System' &&
        !item.message.includes('entered'),
    );
    return !!item;
  }

  /**
   * Determine if request body has `typing indicator` action
   * @param message
   */
  hasTypingIndicatorAction(message: GenesysWebhookBody): boolean {
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
  isTyping(message: GenesysWebhookBody): boolean {
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
  isAvailable(skill: string): boolean {
    return !!skill;
  }

  /**
   * Determine if request body has `wait time` info
   * @param message
   */
  hasWaitTime(message: GenesysWebhookBody): boolean {
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
  getWaitTime(message: GenesysWebhookBody): string {
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
