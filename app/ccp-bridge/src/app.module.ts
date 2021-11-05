import { Module } from '@nestjs/common';
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
      middlewareApiConfig: {
        url: process.env.MIDDLEWARE_API_URL,
        token: process.env.MIDDLEWARE_API_TOKEN,
      },
    }),
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
