import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MiddlewareApi } from './src/middleware-api/middleware-api';
import { MiddlewareApiToken } from './src/middleware-api/constants';
import { MiddlewareApiOptionsFactory } from './src/middleware-api/interfaces';
import { CccModule } from './ccc-module';
import { MiddlewareApiConfig } from './src/middleware-api/types';

describe('CccModule', () => {
  class TestService implements MiddlewareApiOptionsFactory {
    createMiddlewareApiOptions(): MiddlewareApiConfig {
      return {
        url: '',
        token: '',
      };
    }
  }

  @Module({
    exports: [TestService],
    providers: [TestService],
  })
  class TestModule {}

  describe('forRoot', () => {
    it('should provide the ccc client', async () => {
      const module = await Test.createTestingModule({
        imports: [
          CccModule.forRoot({
            url: '',
            token: '',
          }),
        ],
      }).compile();

      const cccClient = module.get<MiddlewareApi>(MiddlewareApiToken);
      expect(cccClient).toBeDefined();
      expect(cccClient).toBeInstanceOf(MiddlewareApi);
    });
  });

  describe('forRootAsync', () => {
    describe('when the `useFactory` option is used', () => {
      it('should provide the ccc client', async () => {
        const module = await Test.createTestingModule({
          imports: [
            CccModule.forRootAsync({
              useFactory: () => ({
                url: '',
                token: '',
              }),
            }),
          ],
        }).compile();

        const cccClient = module.get<MiddlewareApi>(MiddlewareApiToken);
        expect(cccClient).toBeDefined();
        expect(cccClient).toBeInstanceOf(MiddlewareApi);
      });
    });

    describe('when the `useExisting` option is used', () => {
      it('should provide the ccc client', async () => {
        const module = await Test.createTestingModule({
          imports: [
            CccModule.forRootAsync({
              imports: [TestModule],
              useExisting: TestService,
            }),
          ],
        }).compile();

        const cccClient = module.get<MiddlewareApi>(MiddlewareApiToken);
        expect(cccClient).toBeDefined();
        expect(cccClient).toBeInstanceOf(MiddlewareApi);
      });
    });

    describe('when the `useClass` option is used', () => {
      it('should provide the ccc client', async () => {
        const module = await Test.createTestingModule({
          imports: [
            CccModule.forRootAsync({
              useClass: TestService,
            }),
          ],
        }).compile();

        const cccClient = module.get<MiddlewareApi>(MiddlewareApiToken);
        expect(cccClient).toBeDefined();
        expect(cccClient).toBeInstanceOf(MiddlewareApi);
      });
    });
  });
});
