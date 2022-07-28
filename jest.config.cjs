const esbuildOptions = {
    sourcemap: 'inline'
}

module.exports = {
    testEnvironment: "@happy-dom/jest-environment",
    testMatch: ['<rootDir>/test/**/*.spec.ts'],
    setupFilesAfterEnv: ["<rootDir>/build/jest.setup.cjs"],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^src/(.*)$": "<rootDir>/src/$1"
    },
    transform: {
        "^.+\\.tsx?$": ["<rootDir>/build/jest.esbuild.js", esbuildOptions]
    }
}
