const esbuildOptions = {}

module.exports = {
    testEnvironment: "@happy-dom/jest-environment",
    testMatch: ['<rootDir>/test/**/*.spec.ts'],
    setupFilesAfterEnv: ["<rootDir>/build/jest.setup.cjs"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1"
    },
    transform: {
        "^.+\\.tsx?$": ["jest-esbuild", esbuildOptions]
    }
}
