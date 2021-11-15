import { IsArray, IsNotEmpty, IsObject } from 'class-validator';
import { ServiceNowWebhookBodyItem, Message } from '../types';

export class PostBody {
  @IsNotEmpty() requestId: string;
  @IsNotEmpty() clientSessionId: string;
  @IsNotEmpty() nowSessionId: string;
  @IsObject() message: Message;
  @IsNotEmpty() userId: string;
  @IsArray() body: Array<ServiceNowWebhookBodyItem>;
  @IsNotEmpty() agentChat: boolean;
  @IsNotEmpty() completed: boolean;
  @IsNotEmpty() score: number;

  clientVariables?: any;
}
