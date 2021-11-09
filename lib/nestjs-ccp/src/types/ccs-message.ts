import { MessageType } from './message-type';

type User = {
  username: string;
  email?: string;
};

export type CcpMessage = {
  skill?: string;
  message: {
    id?: string;
    value: string;
    type: MessageType;
  };
  sender: User;
  conversationId: string;
  clientVariables?: {
    instanceUrl?: string;
    token?: string;
    middlewareApiUrl?: string;
  };
};
