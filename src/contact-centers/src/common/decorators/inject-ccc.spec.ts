import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Ccc } from '../../../ccc';
import { CccModule } from './../../../ccc-module';
import { InjectCcc } from './inject-ccc';

describe('InjectCcc', () => {
  let module: TestingModule;

  @Injectable()
  class TestService {
    public constructor(@InjectCcc() public readonly cccClient: Ccc) {}
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CccModule.forRoot({})],
      providers: [TestService],
    }).compile();
  });

  describe('when decorating a class constructor parameter', () => {
    it('should inject the Ccc client', () => {
      const testService = module.get(TestService);
      expect(testService).toHaveProperty('cccClient');
      expect(testService.cccClient).toBeInstanceOf(Ccc);
    });
  });
});
