import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';
import { timer } from 'rxjs';
import axios from 'axios';
import { parseISO, differenceInMilliseconds } from 'date-fns';

@Injectable()
export class GenesysWebsocket {
  // wss://echo.websocket.org is a test websocket server
  private ws: WebSocket;
  private isConnect = false;

  constructor() {
    // disable WS in test env
    // https://github.com/mswjs/msw/issues/156#issuecomment-691454902
    // they will support WS soon
    if (process.env.NODE_ENV !== 'test') {
      this.setupConnection().then(() => {
        // eslint-disable-next-line
        console.log('Genesys websocket connection established');
      });
    }
  }

  async setupConnection() {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', 'cee20b0f-1881-4b8e-bea1-4fa625ec0c72');
    params.append(
      'client_secret',
      '_pngpQy8CGpF69dVgOlnWZuCwRjGN1EjKqpv-GpAcYQ',
    );
    const token = await axios.post(
      'https://login.usw2.pure.cloud/oauth/token',
      params,
    );
    const { access_token, token_type } = token.data;
    const channel = await axios.post(
      'https://api.usw2.pure.cloud/api/v2/notifications/channels',
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
    setTimeout(() => {
      // connectUri expired close connection and re-connect
      this.ws.close();
      this.setupConnection();
    }, expireInMilliseconds);
  }

  connect(url: string) {
    this.ws = new WebSocket(url);
    this.ws.on('open', () => {
      this.isConnect = true;
      this.ws.send(Math.random());
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

    this.ws.on('message', (message) => {
      // HANDLER: your logic should goes here
      // eslint-disable-next-line
      console.log(message);
    });
  }

  send(data: any) {
    this.ws.send(data);
  }

  getIsConnect() {
    return this.isConnect;
  }
}
