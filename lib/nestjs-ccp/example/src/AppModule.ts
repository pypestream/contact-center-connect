import { Module } from '@nestjs/common';
import { CcpModule } from './../../src';
import { AppService } from './AppService';
import { ConfigModule } from './ConfigModule';
import { ConfigService } from './ConfigService';

@Module({
  imports: [
    ConfigModule,
    CcpModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        configService.getCcpConfig(),
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
