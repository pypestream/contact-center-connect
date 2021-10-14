import { Module } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Ccp, SdkConfig } from '@ccp/sdk';
import { ccpToken } from './constants';
import { CcpOptionsFactory } from './interfaces';
import { CcpModule } from './CcpModule';

describe('CcpModule', () => {
  class TestService implements CcpOptionsFactory {
    createCcpOptions(): SdkConfig {
      return {
        serviceNow: {
          instanceUrl: '',
        },
      };
    }
  }

  @Module({
    exports: [TestService],
    providers: [TestService],
  })
  class TestModule {}

  describe('forRoot', () => {
    it('should provide the ccp client', async () => {
      const module = await Test.createTestingModule({
        imports: [
          CcpModule.forRoot({
            serviceNow: {
              instanceUrl: '',
            },
          }),
        ],
      }).compile();

      const ccpClient = module.get<Ccp>(ccpToken);
      expect(ccpClient).toBeDefined();
      expect(ccpClient).toBeInstanceOf(Ccp);
    });
  });

  describe('forRootAsync', () => {
    describe('when the `useFactory` option is used', () => {
      it('should provide the ccp client', async () => {
        const module = await Test.createTestingModule({
          imports: [
            CcpModule.forRootAsync({
              useFactory: () => ({
                serviceNow: {
                  instanceUrl: '',
                },
              }),
            }),
          ],
        }).compile();

        const ccpClient = module.get<Ccp>(ccpToken);
        expect(ccpClient).toBeDefined();
        expect(ccpClient).toBeInstanceOf(Ccp);
      });
    });

    describe('when the `useExisting` option is used', () => {
      it('should provide the ccp client', async () => {
        const module = await Test.createTestingModule({
          imports: [
            CcpModule.forRootAsync({
              imports: [TestModule],
              useExisting: TestService,
            }),
          ],
        }).compile();

        const ccpClient = module.get<Ccp>(ccpToken);
        expect(ccpClient).toBeDefined();
        expect(ccpClient).toBeInstanceOf(Ccp);
      });
    });

    describe('when the `useClass` option is used', () => {
      it('should provide the ccp client', async () => {
        const module = await Test.createTestingModule({
          imports: [
            CcpModule.forRootAsync({
              useClass: TestService,
            }),
          ],
        }).compile();

        const ccpClient = module.get<Ccp>(ccpToken);
        expect(ccpClient).toBeDefined();
        expect(ccpClient).toBeInstanceOf(Ccp);
      });
    });
  });
});
