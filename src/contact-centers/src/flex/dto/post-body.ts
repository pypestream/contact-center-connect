import { IsNotEmpty } from 'class-validator';

export class PostBody {
  @IsNotEmpty() EventType: string;
  InstanceSid: string;
  Attributes: string;
  DateCreated: string;
  Index?: string;
  From?: string;
  MessageSid?: string;
  AccountSid: string;
  Source: string;
  @IsNotEmpty() ChannelSid: string;
  ClientIdentity: string;
  RetryCount?: string;
  Body?: string;
}
