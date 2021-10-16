import { Module } from '@nestjs/common';
import { MiddlewareApiController } from './middleware-api.controller';
import { ServiceNowController } from './service-now.controller';
import { ServiceNowTestController } from './service-now-test.controller';
import { MiddlewareApiTestController } from './middleware-api-test.controller';
import { CcpModule } from '@ccp/nestjs-module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppService } from './app.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'sdk-docs'),
      serveRoot: '/docs',
      renderPath: '/index.html',
    }),
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
    ServiceNowController,
    MiddlewareApiController,
    ServiceNowTestController,
    MiddlewareApiTestController,
  ],
})
export class AppModule {}
