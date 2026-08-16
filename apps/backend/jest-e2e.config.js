/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',
  moduleFileExtensions: ['js', 'json', 'ts'],
  testRegex: 'test/.*\\.e2e-spec\\.ts$',
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: 'tsconfig.json' }] },
  moduleNameMapper: { '^@app/shared$': '<rootDir>/../../packages/shared/dist/index.js' },
  testEnvironment: 'node',
  globalSetup: '<rootDir>/test/global-setup.e2e.ts',
  maxWorkers: 1,
};
