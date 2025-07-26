module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  // 支持 ES6 module
  globals: {
    'ts-jest': {
      useESM: true
    }
  },
  extensionsToTreatAsEsm: ['.ts'],
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1'
  }
};