import { IsNotEmpty } from 'class-validator';

export class PutMessageBody {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  senderId: string;

  @IsNotEmpty()
  side: string;
}
