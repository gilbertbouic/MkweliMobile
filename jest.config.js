module.exports = {
  preset: 'react-native',
  testEnvironment: 'node',
  collectCoverageFrom: [
    'App.tsx',
    'sanctions-data.ts',
    '!**/*.test.ts',
    '!**/*.test.tsx',
    '!**/node_modules/**',
  ],
  coverageThresholds: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },
  testMatch: [
    '**/__tests__/**/*.test.ts',
    '**/__tests__/**/*.test.tsx',
  ],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: [],
  testTimeout: 10000,
  verbose: true,
  moduleNameMapper: {
    '^react-native-fs$': '<rootDir>/__mocks__/react-native-fs.js',
  },
};
