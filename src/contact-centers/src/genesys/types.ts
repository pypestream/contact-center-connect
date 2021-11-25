export type GenesysWebhookBody = {
  id: string;
  channel: GenesysChannel;
  type: string;
  text?: string;
  originatingEntity?: string;
  direction: string;
  status?: string;
  clientVariables?: any;
};
export type GenesysChannel = {
  id: string;
  platform: 'Open';
  type: 'Private';
  to: GenesysReceiver;
  from: GenesysSender;
  time: string;
  messageId: string;
};
type GenesysReceiver = {
  nickname?: string;
  id: string;
};
type GenesysSender = {
  nickname?: string;
  id: string;
  idType: 'Opaque';
  firstName?: string;
  lastName?: string;
};
