import { Module } from '@nestjs/common';
import { MiddlewareApiController } from './middleware-api.controller';
import { AgentController } from './agent.controller';
import { AppService } from './app.service';
import { CcpModule } from '@ccp/nestjs-module';

@Module({
  imports: [
    CcpModule.forRoot({
      ccp: {
        instanceUrl: 'http://390c-176-33-109-197.ngrok.io',
      },
      serviceNow: {
        instanceUrl: 'https://dev78406.service-now.com',
      },
      middlewareApi: {
        instanceUrl: 'https://middleware.claybox.usa.pype.engineering',
        token:
          'ydeHKGvMxhpMOeUqvgFG//jdsauXvpFqySTa740KsBdWMSc+3iNBdNRjGLHJ6frY',
      },
    }),
  ],
  providers: [AppService],
  controllers: [AgentController, MiddlewareApiController],
})
export class AppModule {}
