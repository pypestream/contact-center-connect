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
import { HttpStatus } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';

import { v4 as uuidv4 } from 'uuid';
import { AmazonConnectWebhookBody, AmazonConnectCustomer } from './types';
import { getCustomer } from '../common/utils/get-customer';
import { InjectMiddlewareApi } from '../middleware-api/decorators';
import { MiddlewareApi } from '../middleware-api/middleware-api';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import { Request } from 'express';
import { Inject, Logger } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Scope } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { userLeftChatMessage } from '../common/messages-templates';
import { IntegrationName } from '../common/types/agent-services';
import { publicComponents } from '../middleware-api/types';

import {
  ConnectClient,
  StartChatContactCommandInput,
  StartChatContactCommand,
  StartContactStreamingCommand,
  StartContactStreamingCommandInput,
  CurrentMetric,
  Filters,
  GetCurrentMetricDataCommand,
  GetCurrentMetricDataCommandInput,
  GetCurrentMetricDataCommandOutput,
  GetCurrentMetricDataResponse,
} from '@aws-sdk/client-connect';

import {
  ConnectParticipantClient,
  CreateParticipantConnectionCommand,
  CreateParticipantConnectionCommandInput,
  ConnectionType,
  SendMessageCommand,
  SendMessageCommandInput,
  SendMessageCommandOutput,
  SendEventCommand,
  SendEventCommandInput,
  SendEventCommandOutput,
} from '@aws-sdk/client-connectparticipant';
import { filter } from 'rxjs';

@Injectable({ scope: Scope.REQUEST })
export class AmazonConnectService
  implements
    Service<
      AmazonConnectWebhookBody,
      AmazonConnectWebhookBody,
      AmazonConnectWebhookBody
    >,
    GenericWebhookInterpreter<AmazonConnectWebhookBody>,
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
    private readonly middlewareApiService: MiddlewareApiService,
  ) {
    const base64Customer = this.request.headers['x-pypestream-customer'];
    const integration = this.request.headers['x-pypestream-integration'];
    if (
      integration !== IntegrationName.AmazonConnect ||
      typeof base64Customer !== 'string'
    ) {
      return;
    }
    const customer: AmazonConnectCustomer = getCustomer(base64Customer);
    this.customer = customer;
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
    participantToken: string,
    message: CccMessage,
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
    const messageCommandInput: SendMessageCommandInput = {
      Content: message.message.value,
      ContentType: contentType,
      ConnectionToken: cPResp.ConnectionCredentials.ConnectionToken,
    };
    const messageCommand = new SendMessageCommand(messageCommandInput);
    return participantClient.send(messageCommand);
  }

  private async performSendEvent(
    participantToken: string,
    eventType: string,
  ): Promise<SendEventCommandOutput> {
    const participantClient = new ConnectParticipantClient(this.getAWSConfig());

    const cPCCInput: CreateParticipantConnectionCommandInput = {
      ConnectParticipant: true,
      ParticipantToken: participantToken,
      Type: [ConnectionType.CONNECTION_CREDENTIALS],
    };

    const CPCCommand = new CreateParticipantConnectionCommand(cPCCInput);
    const cPResp = await participantClient.send(CPCCommand);
    //console.log(cPResp)
    const eventCommandInput: SendEventCommandInput = {
      ContentType: 'application/vnd.amazonaws.connect.event.' + eventType,
      ConnectionToken: cPResp.ConnectionCredentials.ConnectionToken,
    };
    const eventCommand = new SendEventCommand(eventCommandInput);

    return participantClient.send(eventCommand);
  }

  private async isAgentAvailable(): Promise<GetCurrentMetricDataCommandOutput> {
    const client = new ConnectClient(this.getAWSConfig());
    const metrics: CurrentMetric[] = [
      {
        Name: 'AGENTS_AVAILABLE',
        Unit: 'COUNT',
      },
    ];
    const filters: Filters = {
      Queues: this.customer.queues.split(',').map((val) => val.trim()),
    };
    const input: GetCurrentMetricDataCommandInput = {
      CurrentMetrics: metrics,
      InstanceId: this.customer.instanceId,
      Filters: filters,
    };
    const command = new GetCurrentMetricDataCommand(input);
    return client.send(command);
  }

  /**
   * Send message to Amazon Connect
   * @param message
   */
  async sendMessage(
    message: CccMessage,
    metadata: publicComponents['schemas']['Metadata'],
  ): Promise<AxiosResponse<SendMessageResponse>> {
    const awsToken = metadata.agent.awsToken as string;
    this.performSendMessage(awsToken, message, 'text/plain');

    return Promise.resolve({
      data: {
        status: HttpStatus.CREATED,
        message: 'success',
      },
      statusText: 'ok',
      status: HttpStatus.CREATED,
      headers: {},
      config: {},
    });
  }
  /**
   * End conversation
   * @param conversationId
   */
  async endConversation(
    conversationId: string,
    metadata: publicComponents['schemas']['Metadata'],
  ): Promise<AxiosResponse<any>> {
    const awsToken = metadata.agent.awsToken as string;

    const messageId = uuidv4();
    const message: CccMessage = {
      message: {
        value: userLeftChatMessage,
        type: MessageType.Text,
        id: messageId,
      },
      sender: {
        username: 'test-agent',
        // username: item.agentInfo.agentName,
      },
      conversationId: conversationId,
    };

    this.performSendMessage(awsToken, message, 'text/plain');

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
   * Start new conversation with initial message
   * @param message
   * @param history pass history of end-user
   */
  async startConversation(
    message: CccMessage,
    metadata: publicComponents['schemas']['Metadata'],
  ): Promise<AxiosResponse<StartConversationResponse>> {
    // Start a Chat Contact

    const contactClient = new ConnectClient(this.getAWSConfig());
    const firstName: string =
      (metadata.bot.first_name as string) || 'Pypestream';
    const lastName: string = (metadata.bot.last_name as string) || 'User';
    const sCCInput: StartChatContactCommandInput = {
      InstanceId: this.customer.instanceId,
      ContactFlowId: this.customer.contactFlowId,
      ParticipantDetails: {
        DisplayName: `${firstName} ${lastName}`,
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
      startChatContactResp.ParticipantToken,
      message,
      'text/plain',
    );
    const resp = await this.middlewareApiService.updateAgentMetadata(
      message.conversationId,
      {
        awsToken: startChatContactResp.ParticipantToken,
      },
    );

    return Promise.resolve({
      data: {
        status: 201,
        message: `Mapping:${startChatContactResp.ContactId}`,
        escalationId: startChatContactResp.ContactId,
      },
      statusText: 'ok',
      status: 201,
      headers: {},
      config: {},
    });
  }

  /**
   * Update Typing indicator in agent side
   * @param message
   */

  sendTyping(
    conversationId: string,
    isTyping: boolean,
    metadata: publicComponents['schemas']['Metadata'],
  ): Promise<AxiosResponse<SendMessageResponse>> {
    if (isTyping) {
      const awsToken = metadata.agent.awsToken as string;
      this.performSendEvent(awsToken, 'typing');
    }
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
   * Convert posted body to CCC message
   * @param body
   * @param params
   */
  mapToCccMessage(body: AmazonConnectWebhookBody): CccMessage {
    const messageId = uuidv4();

    return {
      message: {
        value: body.Content,
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
  async isAvailable(skill: string): Promise<boolean> {
    const resp: GetCurrentMetricDataResponse = await this.isAgentAvailable();
    return resp.MetricResults[0]?.Collections[0]?.Value > 0;
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
