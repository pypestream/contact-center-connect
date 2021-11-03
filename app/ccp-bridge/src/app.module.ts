import { Module } from '@nestjs/common';
import { MiddlewareApiController } from './middleware-api.controller';
import { ServiceNowController } from './service-now.controller';
import { CcpModule } from '@ccp/nestjs-module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'sdk-docs'),
      serveRoot: '/docs',
      renderPath: '/index.html',
    }),
    CcpModule.forRoot({
      enableLog: true,
    }),
  ],
  providers: [],
  controllers: [ServiceNowController, MiddlewareApiController],
})
export class AppModule {}
