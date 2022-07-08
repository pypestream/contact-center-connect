export type AmazonConnectWebhookBody = {
  InitialContactId: string;
  AbsoluteTime: string;
  Content?: string;
  ContentType: string;
  Id: string;
  Type: string;
  ParticipantId: string;
  DisplayName: string;
  ParticipantRole: string;
  ContactId: string;
  SubscribeURL?: string;
};
