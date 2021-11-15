import { IsNotEmpty } from 'class-validator';

export class PostTypingBody {
  @IsNotEmpty()
  typing: boolean;
}
