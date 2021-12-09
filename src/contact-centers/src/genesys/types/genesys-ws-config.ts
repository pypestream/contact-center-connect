export type GenesysWsConfig = {
  grantType: 'client_credentials';
  clientId: string;
  clientSecret: string;
  getTokenUrl: string;
  getChannelUrl: string;
  queueId: string;
};
