import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CspModule } from '@csp/nestjs-module';

@Module({
  imports: [
    CspModule.forRoot({
      serviceNow: {
        instanceUrl: 'https://dev78406.service-now.com',
        apiKey: '123',
      },
    }),
  ],
  providers: [AppService],
  controllers: [AppController],
})
export class AppModule {}
