import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { MiddlewareApi } from '../middleware-api';
import { MiddlewareApiModule } from '../middleware-api.module';
import { InjectMiddlewareApi } from './inject-middleware-api';

describe('InjectCcc', () => {
  let module: TestingModule;

  @Injectable()
  class TestService {
    public constructor(
      @InjectMiddlewareApi() public readonly cccClient: MiddlewareApi,
    ) {}
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        MiddlewareApiModule.forRoot({
          url: '',
          token: '',
          basicToken: '',
        }),
      ],
      providers: [TestService],
    }).compile();
  });

  describe('when decorating a class constructor parameter', () => {
    it('should inject the Ccc client', () => {
      const testService = module.get(TestService);
      expect(testService).toHaveProperty('cccClient');
      expect(testService.cccClient).toBeInstanceOf(MiddlewareApi);
    });
  });
});
