import { Inject, Injectable } from '@nestjs/common';
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
  private ws: WebSocket;
  private isConnect = false;

  private connections: GenesysWsConfig[] = [];

  constructor(
    @Inject(REQUEST) private readonly request: Request,
    private readonly middlewareApiService: MiddlewareApiService,
  ) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }
    const base64Customer = this.request.headers['x-pypestream-customer'];
    if (typeof base64Customer !== 'string') {
      return;
    }
    const customer: GenesysCustomer = getCustomer(base64Customer);
    this.addConnection({
      grantType: customer.grantType,
      clientId: customer.clientId,
      clientSecret: customer.clientSecret,
      getTokenUrl: `${customer.oAuthUrl}/oauth/token`,
      getChannelUrl: `${customer.instanceUrl}/api/v2/notifications/channels`,
      queueId: customer.OMQueueId,
    }).then(() => {
      // eslint-disable-next-line
      console.log('Connected to Genesys websocket');
    });
  }

  async addConnection(config: GenesysWsConfig) {
    const exist = this.connections.find((c) => c.clientId === config.clientId);
    if (!exist) {
      this.connections.push(config);
      await this.setupConnection(config);
    }
  }

  async setupConnection(config: GenesysWsConfig) {
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
    this.connect(connectUri);
    this.subscribeToChannel(
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
      this.ws.close();
      await this.setupConnection(config);
    }, expireInMilliseconds);
  }

  connect(url: string) {
    this.ws = new WebSocket(url);
    this.ws.on('open', () => {
      this.isConnect = true;
    });

    this.ws.on('error', (message) => {
      this.ws.close();
      this.isConnect = false;
    });

    this.ws.on('close', (message) => {
      timer(1000).subscribe(() => {
        this.isConnect = false;
        this.connect(url);
      });
    });

    this.ws.on('message', async (message) => {
      // HANDLER: your logic should goes here
      // eslint-disable-next-line
      message = JSON.parse(message);
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

  send(data: any) {
    this.ws.send(data);
  }

  getIsConnect() {
    return this.isConnect;
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
