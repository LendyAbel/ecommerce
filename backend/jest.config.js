/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    setupFiles: ['<rootDir>/src/tests/setup.ts'],
    resetMocks: true,
    collectCoverageFrom: [
        'src/modules/**/*.ts',
        'src/lib/**/*.ts',
        'src/middlewares/**/*.ts',
        '!src/**/*.test.ts',
        '!src/**/*Types.ts',
        '!src/tests/**',
    ],
    // Floors set with a small margin under current coverage so regressions
    // fail CI. Branches is lower because several defensive paths (Prisma error
    // mapping in errorHandler) are hard to hit with a mocked Prisma client.
    coverageThreshold: {
        global: {
            statements: 85,
            branches: 55,
            functions: 85,
            lines: 85,
        },
    },
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.test.json',
        },
    },
};
