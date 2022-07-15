export type MessageBody = {
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
};

export type VerificationBody = {
  Type: string;
  SubscribeURL: string;
};

export type AmazonConnectWebhookBody = VerificationBody | MessageBody;

export enum AmazonContentTypes {
  PARTICIPANT_JOINED = 'application/vnd.amazonaws.connect.event.participant.joined',
  IS_TYPING = 'application/vnd.amazonaws.connect.event.typing',
  PARTICIPANT_LEFT = 'application/vnd.amazonaws.connect.event.participant.left',
}

export enum AmazonParticipantRoles {
  AGENT = 'AGENT',
}
