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
import { GenesysWebhookBody } from './types';
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
        time: new Date().toISOString(),
      },
      type: 'Text',
      text: 'USER ENDED CHAT.',
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
    const token = await this.getAccessToken();
    const headers = {
      Authorization: 'Bearer ' + token,
    };
    const res = await axios.post(
      this.url,
      this.getEndConversationRequestBody(conversationId),
      { headers: headers },
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

    throw new Error('Genesys.sendTyping is not available yet.');
  }

  getEndUserService(): EndUserServices {
    const service = new MiddlewareApiService({
      url: process.env.MIDDLEWARE_API_URL,
      token: process.env.MIDDLEWARE_API_TOKEN,
    });
    return service;
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
      clientVariables: this.GenesysConfig,
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
   * Determine if request body has `end conversation` action
   * @param message
   */
  hasEndConversationAction(message: GenesysWebhookBody): boolean {
    throw new Error('Not implemented');
  }

  /**
   * Determine if request body has `typing indicator` action
   * @param message
   */
  hasTypingIndicatorAction(message: GenesysWebhookBody): boolean {
    throw new Error('Not implemented');
  }
  /**
   * Determine if agent is typing or viewing based on request body
   * @param message
   */
  isTyping(message: GenesysWebhookBody): boolean {
    throw new Error('Not implemented');
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
    throw new Error('Not implemented');
  }

  /**
   * Return estimated wait time in seconds
   * @param message
   */
  getWaitTime(message: GenesysWebhookBody): string {
    throw new Error('Not implemented');
  }

  escalate(): boolean {
    return true;
  }
}
