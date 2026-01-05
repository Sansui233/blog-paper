/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  extensionsToTreatAsEsm: ['.ts'],
  transform: {
    // 匹配 .ts 或 .tsx 文件
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
      },
    ],
  },

  moduleNameMapper: {
    // 兼容 ESM 的路径映射（把 .js 结尾的引用映射回原文件）
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
