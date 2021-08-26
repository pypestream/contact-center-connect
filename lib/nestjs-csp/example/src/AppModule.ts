import { Module } from '@nestjs/common';
import { CspModule } from './../../src';
import { AppService } from './AppService';
import { ConfigModule } from './ConfigModule';
import { ConfigService } from './ConfigService';

@Module({
  imports: [
    ConfigModule,
    CspModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getCspConfig(),
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
