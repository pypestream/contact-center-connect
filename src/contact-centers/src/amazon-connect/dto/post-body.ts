import { IsNotEmpty } from 'class-validator';

export class PostBody {
  InitialContactId: string;
  AbsoluteTime: string;
  Content: string;
  ContentType: string;
  Id: string;
  @IsNotEmpty() Type: string;
  ParticipantId: string;
  DisplayName: string;
  ParticipantRole: string;
  ContactId: string;
  SubscribeURL?: string;
}
