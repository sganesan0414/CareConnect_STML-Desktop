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
    'src/renderer/src/lib/meds.js',
    'src/renderer/src/lib/settings.js',
    'src/renderer/src/lib/appEvents.js',
    'src/renderer/src/pages/app/Medications.jsx',
    'src/renderer/src/pages/app/Settings.jsx',
    'src/renderer/src/pages/app/ShortcutsModal.jsx',
    'src/renderer/src/pages/app/AddMedicationModal.jsx',
    'src/shared/ipc.js',
    'src/shared/routes.js',
    '!**/*.test.js',
    '!**/*.test.jsx',
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};
