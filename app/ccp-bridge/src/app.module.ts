import { Module } from '@nestjs/common';
import { MiddlewareApiController } from './middleware-api.controller';
import { AgentController } from './agent.controller';
import { ServiceNowTestController } from './service-now-test.controller';
import { AppService } from './app.service';
import { CcpModule } from '@ccp/nestjs-module';

@Module({
  imports: [
    CcpModule.forRoot({
      ccp: {
        instanceUrl: 'https://enhvq0q28akbhlm.m.pipedream.net',
      },
      serviceNow: {
        instanceUrl: 'https://dev50996.service-now.com',
      },
      middlewareApi: {
        instanceUrl: 'https://middleware.claybox.usa.pype.engineering',
        token:
          'ydeHKGvMxhpMOeUqvgFG//jdsauXvpFqySTa740KsBdWMSc+3iNBdNRjGLHJ6frY',
      },
    }),
  ],
  providers: [AppService],
  controllers: [
    AgentController,
    MiddlewareApiController,
    ServiceNowTestController,
  ],
})
export class AppModule {}
