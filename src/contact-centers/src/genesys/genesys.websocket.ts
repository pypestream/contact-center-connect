import { Inject, Injectable, Scope } from '@nestjs/common';
import * as WebSocket from 'ws';
import { timer } from 'rxjs';
import axios from 'axios';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { differenceInMilliseconds, parseISO } from 'date-fns';
import { GenesysWsConfig } from './types/genesys-ws-config';
import { GenesysCustomer } from './types';
import { getCustomer } from '../common/utils/get-customer';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';

@Injectable()
export class GenesysWebsocket {
  // wss://echo.websocket.org is a test websocket server
  private ws: WebSocket[];
  private isConnect: boolean[] = [];

  private connections: GenesysWsConfig[] = [];

  constructor(private readonly middlewareApiService: MiddlewareApiService) {}

  async addConnection(config: GenesysWsConfig) {
    const connectionIndex = this.connections.findIndex(
      (c) => c.clientId === config.clientId,
    );
    if (connectionIndex === -1) {
      this.connections.push(config);
      await this.setupConnection(config, this.connections.length - 1);
    }
  }

  async setupConnection(config: GenesysWsConfig, connectionIndex) {
    const params = new URLSearchParams();
    params.append('grant_type', config.grantType);
    params.append('client_id', config.clientId);
    params.append('client_secret', config.clientSecret);
    const token = await axios.post(config.getTokenUrl, params);
    const { access_token, token_type } = token.data;
    const channel = await axios.post(
      config.getChannelUrl,
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
      config.getChannelUrl,
      config.queueId,
      token_type,
      access_token,
    );
    const expireInMilliseconds = differenceInMilliseconds(
      parseISO(expires),
      new Date(),
    );
    setTimeout(async () => {
      // connectUri expired close connection and re-connect
      this.ws[connectionIndex].close();
      await this.setupConnection(config, connectionIndex);
    }, expireInMilliseconds);
  }

  connect(url: string, connectionIndex: number) {
    this.ws[connectionIndex] = new WebSocket(url);
    this.ws[connectionIndex].on('open', () => {
      this.isConnect[connectionIndex] = true;
    });

    this.ws[connectionIndex].on('error', (message) => {
      this.ws[connectionIndex].close();
      this.isConnect[connectionIndex] = false;
    });

    this.ws[connectionIndex].on('close', (message) => {
      timer(1000).subscribe(() => {
        this.isConnect[connectionIndex] = false;
        this.connect(url, connectionIndex);
      });
    });

    this.ws[connectionIndex].on('message', async (stringifyMessage) => {
      // HANDLER: your logic should goes here
      // eslint-disable-next-line
      const message = JSON.parse(stringifyMessage);
      if (message.eventBody.participants) {
        const conversationId =
          message.eventBody.participants[0].attributes.conversationId;
        const participant = message.eventBody.participants.pop();
        if (this.isAgentDisconnected(participant)) {
          //console.log('End chat conversation ID: ', conversationId);
          await this.middlewareApiService.endConversation(conversationId);
        }
      }
    });
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
}
