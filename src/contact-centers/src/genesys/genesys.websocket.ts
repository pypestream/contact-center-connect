import { MessageType } from './../common/types';
import { Injectable, Logger } from '@nestjs/common';
import * as WebSocket from 'ws';
import { timer } from 'rxjs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { differenceInMilliseconds, parseISO } from 'date-fns';
import { GenesysWsConfig } from './types/genesys-ws-config';
import { WebsocketConnection, WebsocketMessageChatInfo } from './types';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import { isEmpty } from 'lodash';

@Injectable()
export class GenesysWebsocket {
  // wss://echo.websocket.org is a test websocket server

  private connections: WebsocketConnection[] = [];

  private lastEndchats: WebsocketMessageChatInfo[] = [];
  private lastJoinChats: WebsocketMessageChatInfo[] = [];

  private readonly logger = new Logger(GenesysWebsocket.name);

  constructor(private readonly middlewareApiService: MiddlewareApiService) {}

  async addConnection(customer: GenesysWsConfig) {
    const connectionIndex = this.connections.findIndex(
      (c) => c.customer.clientId === customer.clientId,
    );
    if (connectionIndex === -1) {
      const connection = {
        customer,
        isConnect: false,
        ws: null,
      };
      this.connections.push(connection);
      await this.setupConnection(this.connections.length - 1);
    } else {
      throw new Error('There is connection open for this genesys client');
    }
  }

  async setupConnection(connectionIndex: number) {
    const params = new URLSearchParams();
    const { customer } = this.connections[connectionIndex];
    params.append('grant_type', customer.grantType);
    params.append('client_id', customer.clientId);
    params.append('client_secret', customer.clientSecret);
    const token = await axios.post(customer.getTokenUrl, params);
    const { access_token, token_type } = token.data;
    const getChannelUrl = `${customer.instanceUrl}/api/v2/notifications/channels`;
    const channel = await axios.post(
      getChannelUrl,
      {},
      {
        headers: {
          authorization: `${token_type} ${access_token}`,
        },
      },
    );
    const { connectUri, expires, id } = channel.data;
    this.connect(connectUri, connectionIndex, access_token);
    await this.subscribeToChannel(
      id,
      getChannelUrl,
      customer.queueId,
      token_type,
      access_token,
    );

    // Reset lastEndchats, lastJoinchats list
    this.lastEndchats = [];
    this.lastJoinChats = [];

    const expireInMilliseconds = differenceInMilliseconds(
      parseISO(expires),
      new Date(),
    );
    setTimeout(async () => {
      // connectUri expired close connection and re-connect
      this.connections[connectionIndex].ws.close();
      await this.setupConnection(connectionIndex);
    }, expireInMilliseconds);
  }

  connect(url: string, connectionIndex: number, accessToken: string) {
    if (this.connections.length <= connectionIndex) {
      throw new Error('Invalid Connection Index');
    }
    this.connections[connectionIndex].ws = new WebSocket(url);

    // eslint-disable-next-line
    // @ts-ignore
    this.connections[connectionIndex].ws.on('open', () => {
      this.connections[connectionIndex].isConnect = true;
    });

    // eslint-disable-next-line
    // @ts-ignore
    this.connections[connectionIndex].ws.on('error', (message) => {
      this.connections[connectionIndex].ws.close();
      this.connections[connectionIndex].isConnect = false;
    });

    // eslint-disable-next-line
    // @ts-ignore
    this.connections[connectionIndex].ws.on('close', (message) => {
      timer(1000).subscribe(() => {
        this.connections[connectionIndex].isConnect = false;
        this.connect(url, connectionIndex, accessToken);
      });
    });

    // eslint-disable-next-line
    // @ts-ignore
    this.connections[connectionIndex].ws.on(
      'message',
      async (stringifyMessage) => {
        // HANDLER: your logic should goes here
        // eslint-disable-next-line
        const message = JSON.parse(stringifyMessage);
        if (message.eventBody.participants) {
          const conversationId = this.getConversationId(
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
          let chatText;
          if (this.isAgentDisconnected(participant)) {
            const lastEndchat = this.lastEndchats.find(
              (p) => p[conversationId] === participant.startAcwTime,
            );
            if (!lastEndchat) {
              this.lastEndchats.push({
                [conversationId]: participant.startAcwTime,
              });
              const chatText = 'Automated message: Agent has left the chat.';
              const message = {
                message: {
                  value: chatText,
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
          } else if (this.isAgentConnected(participant)) {
            const lastJoinchat = this.lastJoinChats.find(
              (p) => p[conversationId] === participant.connectedTime,
            );
            if (!lastJoinchat) {
              this.lastJoinChats.push({
                [conversationId]: participant.connectedTime,
              });
              chatText = 'Automated message: Agent has joined the chat.';
              const message = {
                message: {
                  value: chatText,
                  type: MessageType.Text,
                  id: uuidv4(),
                },
                sender: {
                  username: 'test-agent',
                },
                conversationId: conversationId,
              };

              await this.middlewareApiService.sendMessage(message);
            }
          }
        }
      },
    );
  }

  async subscribeToChannel(
    channelId: string,
    url: string,
    queueId: string,
    tokenType: string,
    accessToken: string,
  ) {
    queueId =
      'a162b32f-fd3f-46fd-b413-90d76328836c,0c54f616-50d6-43a0-9373-ecda0dc0f69b,7b67986c-5c76-4b8c-9d85-5508f4dde09d';
    const reqBody = queueId.split(',').map((queue) => ({
      id: `v2.routing.queues.${queue.trim()}.conversations.messages`,
    }));

    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
    };

    await axios.post(
      `${url}/${channelId}/subscriptions`,
      JSON.stringify(reqBody),
      {
        headers: headers,
      },
    );
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

  isAgentConnected(participant) {
    return participant.purpose === 'agent' && participant.state === 'connected';
  }

  getConversationId(participants) {
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
