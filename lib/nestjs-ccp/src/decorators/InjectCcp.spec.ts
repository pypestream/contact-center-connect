import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Ccp } from '../ccp';
import { CcpModule } from './../CcpModule';
import { InjectCcp } from './InjectCcp';

describe('InjectCcp', () => {
  let module: TestingModule;

  @Injectable()
  class TestService {
    public constructor(@InjectCcp() public readonly ccpClient: Ccp) {}
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CcpModule.forRoot({})],
      providers: [TestService],
    }).compile();
  });

  describe('when decorating a class constructor parameter', () => {
    it('should inject the Ccp client', () => {
      const testService = module.get(TestService);
      expect(testService).toHaveProperty('ccpClient');
      expect(testService.ccpClient).toBeInstanceOf(Ccp);
    });
  });
});
