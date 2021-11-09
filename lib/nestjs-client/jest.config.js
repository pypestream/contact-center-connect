// eslint-disable-next-line no-undef, @typescript-eslint/no-var-requires
const jestConfig = require('@ccc/test-tools/jest.base-config');

jestConfig.setupFilesAfterEnv = ['./test/setup-env.ts'];
// eslint-disable-next-line no-undef
module.exports = jestConfig;
