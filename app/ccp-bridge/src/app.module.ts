import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { MiddlewareApiController } from './middleware-api.controller';
import { AppService } from './app.service';
import { CcpModule } from '@ccp/nestjs-module';

@Module({
  imports: [
    CcpModule.forRoot({
      ccp: {
        instanceUrl: 'http://daa3-176-33-109-197.ngrok.io',
      },
      serviceNow: {
        instanceUrl: 'https://dev78406.service-now.com',
      },
      middlewareApi: {
        instanceUrl: 'https://middleware.claybox.usa.pype.engineering',
        token: 'ydeHKGvMxhpMOeUqvgFG//jdsauXvpFqySTa740KsBdWMSc+3iNBdNRjGLHJ6frY'
      },
    }),
  ],
  providers: [AppService],
  controllers: [AppController, MiddlewareApiController],
})

export class AppModule {}
