import { MessageType } from './../common/types';
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosResponse } from 'axios';
import * as WebSocket from 'ws';
import { timer } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { differenceInMilliseconds, parseISO } from 'date-fns';
import { GenesysWsConfig } from './types/genesys-ws-config';
import { WebsocketConnection, WebsocketMessageChatInfo } from './types';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import { isEmpty } from 'lodash';
import { HttpService } from '@nestjs/axios';
import { FeatureFlagService } from '../feature-flag/feature-flag.service';
import { FeatureFlagEnum } from '../feature-flag/feature-flag.enum';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  agentJoinedChatMessage,
  agentLeftChatMessage,
} from '../common/messages-templates';

@Injectable()
export class GenesysWebsocket {
  // wss://echo.websocket.org is a test websocket server

  private connections: { [x: string]: WebsocketConnection } = {};

  private lastEndChats: { [x: string]: string } = {};
  private lastJoinChats: { [x: string]: string } = {};

  private readonly logger = new Logger(GenesysWebsocket.name);

  constructor(
    private readonly middlewareApiService: MiddlewareApiService,
    private readonly featureFlagService: FeatureFlagService,
    private httpService: HttpService,
  ) {}

  async addConnection(customer: GenesysWsConfig) {
    const connection = this.connections[customer.clientId];
    if (
      !connection ||
      !connection.ws ||
      !connection.isConnect ||
      differenceInMilliseconds(connection.expireAt, new Date()) < 0
    ) {
      const newConnection = {
        customer,
        isConnect: false,
        ws: null,
        expireAt: null,
      };
      this.connections[customer.clientId] = newConnection;
      await this.setupConnection(customer);
    } else {
      throw new Error('There is connection open for this genesys client');
    }
  }

  async setupConnection(customer: GenesysWsConfig) {
    const token = await this.getAccessToken(customer);
    const { access_token, token_type } = token.data;
    const getChannelUrl = `${customer.instanceUrl}/api/v2/notifications/channels`;
    const channel = await this.httpService
      .post(
        getChannelUrl,
        {},
        {
          headers: {
            authorization: `${token_type} ${access_token}`,
          },
        },
      )
      .toPromise();
    const { connectUri, expires, id } = channel.data;
    await this.connect(connectUri, customer);
    await this.subscribeToChannel(
      id,
      getChannelUrl,
      customer.queueId,
      token_type,
      access_token,
    );

    // Reset lastEndChats, lastJoinchats list
    this.lastEndChats = {};
    this.lastJoinChats = {};

    this.connections[customer.clientId].expireAt = parseISO(expires);
  }

  destroyConnection(connection: WebsocketConnection) {
    if (connection.ws && connection.ws.close) {
      connection.ws.close();
    }
    connection.ws = null;
    connection.isConnect = false;
  }

  @Cron(CronExpression.EVERY_MINUTE)
  handleExpiredConnections() {
    Object.keys(this.connections).forEach(async (key, index) => {
      const connection = this.connections[key];
      if (
        connection.expireAt &&
        differenceInMilliseconds(connection.expireAt, new Date()) < 0
      ) {
        // if connection is expired then destroy it and reconnect
        const customer = connection.customer;
        this.destroyConnection(this.connections[key]);
        await this.setupConnection(customer);
      } else if (!connection.ws && connection.customer) {
        // if connection closed or there is error in connection reconnect
        const customer = connection.customer;
        await this.setupConnection(customer);
      }
    });
  }

  async connect(url: string, customer: GenesysWsConfig) {
    if (!this.connections[customer.clientId]) {
      throw new Error('Invalid Connection');
    }
    const key = customer.clientId;
    this.connections[key].ws = new WebSocket(url);

    this.connections[key].ws.on('open', () => {
      this.connections[key].isConnect = true;
    });

    this.connections[key].ws.on('error', (message) => {
      this.destroyConnection(this.connections[key]);
    });

    this.connections[key].ws.on('close', (message) => {
      this.destroyConnection(this.connections[key]);
    });

    // eslint-disable-next-line
    // @ts-ignore
    this.connections[key].ws.on('message', async (stringifyMessage) => {
      // HANDLER: your logic should goes here
      // eslint-disable-next-line
      const message = JSON.parse(stringifyMessage);
      if (message.eventBody.participants) {
        const conversationId = await this.getConversationId(
          message.eventBody.participants,
        );
        if (!conversationId) {
          this.logger.warn(
            `Not able to find conversation id for this message: ${JSON.stringify(
              message,
            )}`,
          );
          return;
        }
        const participant = message.eventBody.participants.pop();

        if (this.isAgentDisconnected(participant)) {
          const lastEndChat =
            this.lastEndChats[conversationId] === participant.id;
          if (!lastEndChat) {
            this.lastEndChats[conversationId] = participant.id;
            const message = {
              message: {
                value: agentLeftChatMessage,
                type: MessageType.Text,
                id: uuidv4(),
              },
              sender: {
                username: 'test-agent',
              },
              conversationId: conversationId,
            };
            await this.middlewareApiService.sendMessage(message);
            await this.middlewareApiService.endConversation(conversationId);
          }
        } else if (this.didAgentRejectChat(participant)) {
          // const token = await this.getAccessToken(customer);
          // const { access_token, token_type } = token.data;
          // const messageId =
          //   message.eventBody.participants[0].messages[0].message.id;
          // const genesysConversationId = await this.getGenesysConversationId(
          //   messageId,
          //   token_type,
          //   access_token,
          //   customer.instanceUrl,
          // );
          // // await this.disconnectGenesysConversation(
          // //   genesysConversationId,
          // //   token_type,
          // //   access_token,
          // //   customer.instanceUrl,
          // // );
          // // await this.middlewareApiService.endConversation(conversationId);
        } else if (this.isAgentConnected(participant)) {
          const lastJoinChat =
            this.lastJoinChats[conversationId] === participant.id;
          if (!lastJoinChat) {
            this.lastJoinChats[conversationId] = participant.id;
            const message = {
              message: {
                value: agentJoinedChatMessage,
                type: MessageType.Text,
                id: uuidv4(),
              },
              sender: {
                username: 'test-agent',
              },
              conversationId: conversationId,
            };
            await this.middlewareApiService.agentAcceptedEscalation(
              conversationId,
            );
            await this.middlewareApiService.sendMessage(message);
          }
        }
      }
    });
  }

  async getAccessToken(customer: GenesysWsConfig): Promise<AxiosResponse<any>> {
    const params = new URLSearchParams();
    params.append('grant_type', customer.grantType);
    params.append('client_id', customer.clientId);
    params.append('client_secret', customer.clientSecret);
    return this.httpService.post(customer.getTokenUrl, params).toPromise();
  }

  async subscribeToChannel(
    channelId: string,
    url: string,
    queueId: string,
    tokenType: string,
    accessToken: string,
  ) {
    const reqBody = JSON.stringify([
      {
        id: `v2.routing.queues.${queueId}.conversations.messages`,
      },
    ]);
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
    };

    await this.httpService
      .post(`${url}/${channelId}/subscriptions`, reqBody, {
        headers: headers,
      })
      .toPromise();
  }
  async getGenesysConversationId(
    messageId: string,
    tokenType: string,
    accessToken: string,
    url: string,
  ) {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
    };
    try {
      const res = await this.httpService
        .get(`${url}/api/v2/conversations/messages/${messageId}/details`, {
          headers: headers,
        })
        .toPromise();
      return res.data.conversationId;
    } catch (error) {
      //console.log(error.response.status)
      return '';
    }
  }

  async disconnectGenesysConversation(
    genesysConversationId: string,
    tokenType: string,
    accessToken: string,
    url: string,
  ): Promise<AxiosResponse<any>> {
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
    };
    return this.httpService
      .patch(
        `${url}/api/v2/conversations/chats/${genesysConversationId}`,
        { state: 'disconnected' },
        { headers: headers },
      )
      .toPromise();
  }

  isAgentDisconnected(participant) {
    return (
      participant &&
      participant.purpose === 'agent' &&
      participant.state === 'disconnected' &&
      participant.disconnectType === 'client' &&
      participant.startAcwTime
    );
  }

  didAgentRejectChat(participant) {
    return (
      participant &&
      participant.purpose === 'agent' &&
      participant.state === 'disconnected' &&
      participant.disconnectType === 'client' &&
      !participant.connectedTime &&
      !participant.wrapupRequired
    );
  }

  isAgentConnected(participant) {
    return participant.purpose === 'agent' && participant.state === 'connected';
  }

  async getConversationId(participants) {
    // Looking the participant has attributes which includes conversation id
    if (isEmpty(participants)) {
      return null;
    }
    const endUser = participants.find((p) => p.attributes.conversationId);
    if (!endUser) {
      return null;
    }
    return endUser.attributes.conversationId;
  }
}
