import {
  CccMessage,
  EndUserServices,
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
import { GenesysConfig, GenesysWebhookBody } from './types';
import { MiddlewareApiService } from '../middleware-api/service';

/* eslint-disable */
const axiosRetry = require('axios-retry');
const qs = require('qs');
/* eslint-disable */

axiosRetry(axios, { retries: 3 });

export class GenesysService
  implements
    Service<GenesysWebhookBody, GenesysWebhookBody, GenesysWebhookBody>,
    GenericWebhookInterpreter<GenesysWebhookBody>,
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
    genesysConfig: GenesysConfig = {
      instanceUrl: '',
      oAuthUrl: '',
      clientId: '',
      clientSecret: '',
      grantType: '',
      OMIntegrationId: '',
    },
  ) {
    this._genesysConfig = genesysConfig;
    if (genesysConfig.instanceUrl) {
      this._url = `${genesysConfig.instanceUrl}/api/v2/conversations/messages/inbound/open`;
    } else {
      this._url = '';
    }
    this._oAuthUrl = genesysConfig.oAuthUrl
      ? `${genesysConfig.oAuthUrl}/oauth/token`
      : '';
    this._clientId = genesysConfig.clientId ? genesysConfig.clientId : '';
    this._clientSecret = genesysConfig.clientSecret
      ? genesysConfig.clientSecret
      : '';
    this._grantType = genesysConfig.grantType ? genesysConfig.grantType : '';
    this._OMIntegrationId = genesysConfig.OMIntegrationId
      ? genesysConfig.OMIntegrationId
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
    const res = await axios.post(this._oAuthUrl, qs.stringify(reqBody));
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
    const res = await axios.post(
      this._url,
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

    return await axios.patch(
      `${this._genesysConfig.instanceUrl}/api/v2/conversations/chats/${genesysConversationId}`,
      { state: 'disconnected' },
      { headers: headers },
    );
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
    return await axios.post(
      this._url,
      this.startConversationRequestBody(message),
      { headers: headers },
    );
  }
  /**
   * Update Typing indicator in agent side
   * @param message
   */

  async sendTyping(
    conversationId: string,
    isTyping: boolean,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (!this._url) {
      throw new Error('Genesys.sendTyping instance-url must has value');
    }

    if (!conversationId) {
      throw new Error(
        'Genesys.sendTyping conversationId param is required parameter',
      );
    }
    throw 'Genesys.sendTyping is not available yet.';
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
