import { Injectable } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {Csp} from '@csp/sdk';
import { CspModule } from './../CspModule';
import { InjectCsp } from './InjectCsp';

describe('InjectCsp', () => {
  let module: TestingModule;

  @Injectable()
  class TestService {
    public constructor(@InjectCsp() public readonly cspClient: Csp) {}
  }

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [CspModule.forRoot({ services: [] })],
      providers: [TestService],
    }).compile();
  });

  describe('when decorating a class constructor parameter', () => {
    it('should inject the Csp client', () => {
      const testService = module.get(TestService);
      expect(testService).toHaveProperty('cspClient');
      expect(testService.cspClient).toBeInstanceOf(Csp);
    });
  });
});
