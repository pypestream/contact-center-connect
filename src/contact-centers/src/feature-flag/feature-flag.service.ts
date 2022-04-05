import { Injectable } from '@nestjs/common';
import { LDClient, LDUser } from 'launchdarkly-node-server-sdk';
import { FeatureFlagEnum } from './feature-flag.enum';

const user: LDUser = {
  key: 'nsammour@pypestream.com',
};

@Injectable()
export class FeatureFlagService {
  public constructor(private readonly ldClient: LDClient) {}

  public async isFlagEnabled(flag: FeatureFlagEnum): Promise<boolean> {
    return this.ldClient.variation(flag, user, false);
  }
}
