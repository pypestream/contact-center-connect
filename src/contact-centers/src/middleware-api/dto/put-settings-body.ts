import { IsNotEmpty, IsObject } from 'class-validator';

export class PutSettingsBody {
  @IsNotEmpty() callbackURL: string;

  callbackToken: string;

  @IsNotEmpty() integrationName: string;

  @IsObject() integrationFields: any;
}
