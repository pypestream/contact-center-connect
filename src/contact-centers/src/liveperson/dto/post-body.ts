import { IsNotEmpty } from 'class-validator';
import { Changes } from '../types';

export class PostBody {
  kind: string;
  body: {
    changes: [Changes];
  };
  @IsNotEmpty() type: string;
}
