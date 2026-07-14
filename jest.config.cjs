/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  setupFilesAfterEnv: ['<rootDir>/src/test/setupTests.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/renderer/src/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '\\.(css)$': 'identity-obj-proxy',
  },
  transform: {
    '^.+\\.(js|jsx)$': [
      'babel-jest',
      {
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          ['@babel/preset-react', { runtime: 'automatic' }],
        ],
      },
    ],
  },
  collectCoverageFrom: [
    'src/renderer/src/lib/**/*.js',
    'src/renderer/src/pages/**/*.jsx',
    'src/renderer/src/App.jsx',
    'src/shared/**/*.js',
    '!**/*.test.js',
    '!**/*.test.jsx',
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
};
