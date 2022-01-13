import { MessageType } from './../common/types';
import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';
import { timer } from 'rxjs';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { differenceInMilliseconds, parseISO } from 'date-fns';
import { GenesysWsConfig } from './types/genesys-ws-config';
import { WebsocketConnection } from './types';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';

@Injectable()
export class GenesysWebsocket {
  // wss://echo.websocket.org is a test websocket server

  private connections: WebsocketConnection[] = [];

  private lastEndchats: any[] = [];
  private lastJoinChats: any[] = [];

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
    const channel = await axios.post(
      customer.getChannelUrl,
      {},
      {
        headers: {
          authorization: `${token_type} ${access_token}`,
        },
      },
    );
    const { connectUri, expires, id } = channel.data;
    this.connect(connectUri, connectionIndex);
    await this.subscribeToChannel(
      id,
      customer.getChannelUrl,
      customer.queueId,
      token_type,
      access_token,
    );
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

  connect(url: string, connectionIndex: number) {
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
        this.connect(url, connectionIndex);
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
          //console.log('All participants: ', message.eventBody.participants)
          const conversationId = this.getConversationId(
            message.eventBody.participants,
          );
          const participant = message.eventBody.participants.pop();
          let chatText;
          if (this.isAgentDisconnected(participant)) {
            const lastEndchat = this.lastEndchats.find(
              (p) => p[conversationId] === participant.endAcwTime,
            );
            if (!lastEndchat) {
              this.lastEndchats.push({
                [conversationId]: participant.endAcwTime,
              });
              chatText = 'Automated message: Agent has left the chat.';
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
            }
          }

          if (chatText) {
            const message = {
              message: {
                value: chatText,
                type: MessageType.Text,
                id: uuidv4(),
              },
              sender: {
                username: 'test-agent',
                // username: item.agentInfo.agentName,
              },
              conversationId: conversationId,
            };

            await this.middlewareApiService.sendMessage(message);
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
    const reqBody = JSON.stringify([
      {
        id: `v2.routing.queues.${queueId}.conversations.messages`,
      },
    ]);
    const headers = {
      Authorization: `${tokenType} ${accessToken}`,
      'Content-Type': 'application/json',
    };

    await axios.post(`${url}/${channelId}/subscriptions`, reqBody, {
      headers: headers,
    });
  }

  isAgentDisconnected(participant) {
    return (
      participant.purpose === 'agent' &&
      participant.state === 'disconnected' &&
      participant.disconnectType === 'client' &&
      participant.endAcwTime
    );
  }

  isAgentConnected(participant) {
    return participant.purpose === 'agent' && participant.state === 'connected';
  }

  getConversationId(participants) {
    // Looking the participant has attributes which includes conversation id
    const endUser = participants.find((p) => p.attributes.conversationId);
    return endUser.attributes.conversationId;
  }
}
