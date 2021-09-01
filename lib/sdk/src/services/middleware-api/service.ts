import {
  CcpMessage,
  MessageType,
  SendMessageResponse,
  MiddlewareApiConfig,
  ContactCenterProConfig
} from '../common/interfaces';
import axis from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ContactCenterProApiWebhookBody, SettingsObject } from './types';

export class MiddlewareApiService {
  config: MiddlewareApiConfig;
  ccpConfig: ContactCenterProConfig;

  constructor(ccpConfig: ContactCenterProConfig, config: MiddlewareApiConfig) {
    this.config = config;
    this.ccpConfig = ccpConfig;
  }

  sendMessageRequestBody(message: CcpMessage) {
    const requestId = uuidv4();
    return {
      requestId,
      action: 'AGENT',
      // Currently unused.
      enterpriseId: 'ServiceNow',
      // Currently unused.
      nowBotId: '',
      clientSessionId: message.conversationId,
      // Currently unused.
      nowSessionId: '',
      message: {
        text: message.message.value,
        typed: true,
        clientMessageId: message.message.id
      },
      userId: message.sender.username,
      emailId: message.sender.email,
      timestamp: '1588824102',
      timezone: 'America/New_York'
    };
  }

  sendMessage(message: CcpMessage): Promise<SendMessageResponse> {
    axis.post(
      this.config.instanceUrl + '/api/sn_va_as_service/bot/integration',
      this.sendMessageRequestBody(message)
    );
    return Promise.resolve(undefined);
  }

  mapToCcpMessage(body: ContactCenterProApiWebhookBody): CcpMessage {
    return {
      message: {
        value: body.body[0].value,
        type: MessageType.Text
      },
      sender: {
        username: body.body[0].group
      },
      conversationId: body.clientSessionId
    };
  }

  isMessageSentByAgent(message: ContactCenterProApiWebhookBody): boolean {
    return message.body[0].agentInfo.sentFromAgent;
  }

  isChatEnded(message: ContactCenterProApiWebhookBody): boolean {
    return message.completed;
  }

  async getSettings() {
    const result = await axis.get(
      `${this.config.instanceUrl}/contactCenter/v1/settings`
    );
    return result.data;
  }

  async putSettings(token, data: SettingsObject) {
    const result = await axis.put(
      `${this.config.instanceUrl}/contactCenter/v1/settings`,
      data,
      {
        headers: {
          'x-pypestream-token': token
        }
      }
    );
    return result.data;
  }
}
