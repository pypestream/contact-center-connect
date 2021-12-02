import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { CccModule } from './contact-centers/ccc-module';
import { BodyMiddleware } from './contact-centers/src/common/middlewares/body-middleware';
import { MiddlewareConsumer } from '@nestjs/common';

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, 'sdk-docs'),
      serveRoot: '/docs',
      renderPath: '/index.html',
    }),
    CccModule.forRoot({
      url: process.env.MIDDLEWARE_API_URL,
      token: process.env.MIDDLEWARE_API_TOKEN,
    }),
  ],
  providers: [],
  controllers: [],
})
export class AppModule {}
