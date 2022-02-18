import {
  CccMessage,
  MessageType,
  SendMessageResponse,
} from './../common/types';
import { Service, AgentService } from '../common/interfaces';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { v4 as uuidv4 } from 'uuid';
import { AmazonConnectWebhookBody, AmazonConnectCustomer } from './types';
import { getCustomer } from '../common/utils/get-customer';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';
import { Request } from 'express';
import { Inject, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Scope, HttpService } from '@nestjs/common';
import { Injectable } from '@nestjs/common';

import {
  ConnectClient,
  StartChatContactCommandInput,
  StartChatContactCommand,
  StartContactStreamingCommand,
  StartContactStreamingCommandInput,
} from '@aws-sdk/client-connect';

import {
  ConnectParticipantClient,
  CreateParticipantConnectionCommand,
  CreateParticipantConnectionCommandInput,
  ConnectionType,
  SendMessageCommand,
  SendMessageCommandInput,
  SendMessageCommandOutput,
} from '@aws-sdk/client-connectparticipant';

@Injectable({ scope: Scope.REQUEST })
export class AmazonConnectService
  implements
    Service<
      AmazonConnectWebhookBody,
      AmazonConnectWebhookBody,
      AmazonConnectWebhookBody
    >,
    AgentService
{
  /**
   * @ignore
   */
  private customer: AmazonConnectCustomer;
  private readonly logger = new Logger(AmazonConnectService.name);

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    @InjectMiddlewareApi() private readonly middlewareApi: MiddlewareApi,
    private httpService: HttpService,
  ) {
    const base64Customer = this.request.headers['x-pypestream-customer'];
    const integration = this.request.headers['x-pypestream-integration'];
    if (integration !== 'Genesys' || typeof base64Customer !== 'string') {
      return;
    }

    const customer: AmazonConnectCustomer = getCustomer(base64Customer);
    this.customer = customer;

    if (process.env.NODE_ENV === 'test') {
      return;
    }
  }

  /**
   * @ignore
   */
  private getAWSConfig() {
    return {
      region: this.customer.region,
      credentials: {
        accessKeyId: this.customer.accessKeyId,
        secretAccessKey: this.customer.secretAcessKey,
      },
    };
  }

  private async performSendMessage(
    message: CccMessage,
    participantToken: string,
    contentType: string,
  ): Promise<SendMessageCommandOutput> {
    const participantClient = new ConnectParticipantClient(this.getAWSConfig());

    const cPCCInput: CreateParticipantConnectionCommandInput = {
      ConnectParticipant: true,
      ParticipantToken: participantToken,
      Type: [ConnectionType.CONNECTION_CREDENTIALS],
    };

    const CPCCommand = new CreateParticipantConnectionCommand(cPCCInput);
    const cPResp = await participantClient.send(CPCCommand);
    //console.log(cPResp)

    const messageCommandInput: SendMessageCommandInput = {
      Content: message.message.value,
      ContentType: contentType,
      ConnectionToken: cPResp.ConnectionCredentials.ConnectionToken,
    };

    const messageCommand = new SendMessageCommand(messageCommandInput);

    return participantClient.send(messageCommand);
  }

  /**
   * Send message to Amazon Connect
   * @param message
   */
  async sendMessage(
    message: CccMessage,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    this.performSendMessage(
      message,
      'NEED_TO_USE_PARTICIPANT_TOKEN_FROM_STARTCONVERSATION',
      'text/plain',
    );

    return Promise.resolve({
      data: {
        status: 201,
        message: 'success',
      },
      statusText: 'ok',
      status: 201,
      headers: {},
      config: {},
    });
  }
  /**
   * End conversation
   * @param conversationId
   */
  async endConversation(conversationId: string): Promise<AxiosResponse<any>> {
    const token = await 'this.getAccessToken()';
    const config: AxiosRequestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const domain = 'this.customer.instanceUrl';
    const messageSent = this.httpService.post(domain, conversationId, config);

    return messageSent.toPromise();
  }
  /**
   * Start new conversation with initial message
   * @param message
   * @param history pass history of end-user
   */
  async startConversation(
    message: CccMessage,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    // Start a Chat Contact

    const contactClient = new ConnectClient(this.getAWSConfig());
    const sCCInput: StartChatContactCommandInput = {
      InstanceId: this.customer.instanceId,
      ContactFlowId: this.customer.contactFlowId,
      ParticipantDetails: {
        DisplayName: 'PS User',
      },
    };
    const sCCCommand = new StartChatContactCommand(sCCInput);
    const startChatContactResp = await contactClient.send(sCCCommand);

    // Enable realtime streaming
    const sCSInput: StartContactStreamingCommandInput = {
      InstanceId: this.customer.instanceId,
      ContactId: startChatContactResp.ContactId,
      ChatStreamingConfiguration: {
        StreamingEndpointArn: this.customer.SNSTopicARN,
      },
    };
    const sCSCommand = new StartContactStreamingCommand(sCSInput);
    contactClient.send(sCSCommand);

    this.performSendMessage(
      message,
      startChatContactResp.ParticipantToken,
      'text/plain',
    );

    return Promise.resolve({
      data: {
        status: 201,
        message: `Mapping:${startChatContactResp.ContactId}`,
      },
      statusText: 'ok',
      status: 201,
      headers: {},
      config: {},
    });
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
   * Update Typing indicator in agent side
   * @param message
   */

  sendTyping(
    conversationId: string,
    isTyping: boolean,
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (!'this.customer.instanceUrl') {
      throw new Error('AmazonConnect.sendTyping instance-url must has value');
    }

    if (!conversationId) {
      throw new Error(
        'AmazonConnect.sendTyping conversationId param is required parameter',
      );
    }

    const res = this.httpService.post(
      'this.customer.instanceUrl',
      this.getTypingRequestBody(conversationId, isTyping),
    );

    return res.toPromise();
  }

  /**
   * Convert posted body to CCC message
   * @param body
   * @param params
   */
  mapToCccMessage(body: AmazonConnectWebhookBody): CccMessage {
    const messageId = uuidv4();

    return {
      message: {
        value: body.ContentType,
        type: MessageType.Text,
        id: messageId,
      },
      sender: {
        username: 'test-agent',
        // username: item.agentInfo.agentName,
      },
      conversationId: body.InitialContactId,
    };
  }

  /**
   * Determine if request body is new message from Agent
   * @param message
   */
  hasNewMessageAction(message: AmazonConnectWebhookBody): boolean {
    return !!message.Content && message.ParticipantRole === 'AGENT';
  }

  /**
   * Determine if request body has `end conversation` action
   * @param message
   */
  hasEndConversationAction(message: AmazonConnectWebhookBody): boolean {
    return (
      message.ContentType ===
        'application/vnd.amazonaws.connect.event.participant.left' &&
      message.ParticipantRole === 'AGENT'
    );
  }

  /**
   * Determine if agent is typing
   * @param message
   */
  isTyping(message: AmazonConnectWebhookBody): boolean {
    return (
      message.ContentType ===
        'application/vnd.amazonaws.connect.event.typing' &&
      message.ParticipantRole === 'AGENT'
    );
  }

  /**
   * Determine if agent has joined the chat
   * @param message
   */
  hasAgentJoined(message: AmazonConnectWebhookBody): boolean {
    return (
      message.ContentType ===
        'application/vnd.amazonaws.connect.event.participant.joined' &&
      message.ParticipantRole === 'AGENT'
    );
  }

  /**
   * Determine if agent is available to receive new message
   * @param message
   */
  isAvailable(skill: string): boolean {
    return !!skill;
  }

  /**
   * Return estimated wait time in seconds
   * @param message
   */
  getWaitTime(_: any): any {
    return 0;
  }

  escalate(): boolean {
    return true;
  }
}
