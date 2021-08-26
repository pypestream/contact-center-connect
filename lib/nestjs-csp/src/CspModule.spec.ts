import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import {Csp, CspConfig} from '@csp/sdk';
import { cspToken } from './constants';
import { CspOptionsFactory } from './interfaces';
import { CspModule } from './CspModule';

describe('CspModule', () => {
  const apiKey = 'test';

  class TestService implements CspOptionsFactory {
    createCspOptions(): CspConfig {
      return {
        services: []
      };
    }
  }

  @Module({
    exports: [TestService],
    providers: [TestService],
  })
  class TestModule {}

  describe('forRoot', () => {
    it('should provide the csp client', async () => {
      const module = await Test.createTestingModule({
        imports: [CspModule.forRoot({ services: [] })],
      }).compile();

      const cspClient = module.get<Csp>(cspToken);
      expect(cspClient).toBeDefined();
      expect(cspClient).toBeInstanceOf(Csp);
    });
  });

  describe('forRootAsync', () => {
    describe('when the `useFactory` option is used', () => {
      it('should provide the csp client', async () => {
        const module = await Test.createTestingModule({
          imports: [
            CspModule.forRootAsync({
              useFactory: () => ({ services: [] }),
            }),
          ],
        }).compile();

        const cspClient = module.get<Csp>(cspToken);
        expect(cspClient).toBeDefined();
        expect(cspClient).toBeInstanceOf(Csp);
      });
    });

    describe('when the `useExisting` option is used', () => {
      it('should provide the csp client', async () => {
        const module = await Test.createTestingModule({
          imports: [
            CspModule.forRootAsync({
              imports: [TestModule],
              useExisting: TestService,
            }),
          ],
        }).compile();

        const cspClient = module.get<Csp>(cspToken);
        expect(cspClient).toBeDefined();
        expect(cspClient).toBeInstanceOf(Csp);
      });
    });

    describe('when the `useClass` option is used', () => {
      it('should provide the csp client', async () => {
        const module = await Test.createTestingModule({
          imports: [
            CspModule.forRootAsync({
              useClass: TestService,
            }),
          ],
        }).compile();

        const cspClient = module.get<Csp>(cspToken);
        expect(cspClient).toBeDefined();
        expect(cspClient).toBeInstanceOf(Csp);
      });
    });
  });
});
