import * as WebSocket from 'ws';
import { GenesysWsConfig } from './genesys-ws-config';

export type WebsocketConnection = {
  customer: GenesysWsConfig;
  isConnect: boolean;
  ws: WebSocket;
  expireAt: Date;
};
