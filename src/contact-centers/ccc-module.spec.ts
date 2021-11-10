import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Ccc } from './ccc';
import { SdkConfig } from './src/common/types';
import { cccToken } from './src/common/constants';
import { CccOptionsFactory } from './src/common/interfaces';
import { CccModule } from './ccc-module';

describe('CccModule', () => {
  class TestService implements CccOptionsFactory {
    createCccOptions(): SdkConfig {
      return {
        enableLog: true,
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
            enableLog: true,
          }),
        ],
      }).compile();

      const cccClient = module.get<Ccc>(cccToken);
      expect(cccClient).toBeDefined();
      expect(cccClient).toBeInstanceOf(Ccc);
    });
  });

  describe('forRootAsync', () => {
    describe('when the `useFactory` option is used', () => {
      it('should provide the ccc client', async () => {
        const module = await Test.createTestingModule({
          imports: [
            CccModule.forRootAsync({
              useFactory: () => ({
                enableLog: true,
              }),
            }),
          ],
        }).compile();

        const cccClient = module.get<Ccc>(cccToken);
        expect(cccClient).toBeDefined();
        expect(cccClient).toBeInstanceOf(Ccc);
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

        const cccClient = module.get<Ccc>(cccToken);
        expect(cccClient).toBeDefined();
        expect(cccClient).toBeInstanceOf(Ccc);
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

        const cccClient = module.get<Ccc>(cccToken);
        expect(cccClient).toBeDefined();
        expect(cccClient).toBeInstanceOf(Ccc);
      });
    });
  });
});
