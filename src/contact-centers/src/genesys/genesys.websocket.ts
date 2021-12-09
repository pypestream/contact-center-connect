import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';
import { timer } from 'rxjs';
import axios from 'axios';
import { differenceInMilliseconds, parseISO } from 'date-fns';
import { MiddlewareApiService } from '../middleware-api/middleware-api.service';
import { GenesysWsConfig } from './types/genesys-ws-config';

@Injectable()
export class GenesysWebsocket {
  // wss://echo.websocket.org is a test websocket server
  private ws: WebSocket;
  private isConnect = false;

  private connections: GenesysWsConfig[] = [];

  constructor(private readonly middlewareApiService: MiddlewareApiService) {
    // disable WS in test env
    // https://github.com/mswjs/msw/issues/156#issuecomment-691454902
    // they will support WS soon
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
    const { connectUri, expires } = channel.data;
    this.connect(connectUri);
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
      const isEndConversation = true;
      if (isEndConversation) {
        await this.middlewareApiService.endConversation('conversation-id');
      }
    });
  }

  send(data: any) {
    this.ws.send(data);
  }

  getIsConnect() {
    return this.isConnect;
  }
}
