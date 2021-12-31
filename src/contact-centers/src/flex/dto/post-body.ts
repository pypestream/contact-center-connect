import { IsNotEmpty } from 'class-validator';

export class PostBody {
  EventType: string;
  InstanceSid: string;
  Attributes: string;
  DateCreated: string;
  Index: string;
  From: string;
  MessageSid: string;
  AccountSid: string;
  Source: string;
  ChannelSid: string;
  ClientIdentity: string;
  RetryCount?: string;
  @IsNotEmpty() Body: string;
}
