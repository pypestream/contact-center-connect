import { IsNotEmpty } from 'class-validator';

export class PostEscalateBody {
  @IsNotEmpty()
  skill: string;

  @IsNotEmpty()
  userId: string;
}
