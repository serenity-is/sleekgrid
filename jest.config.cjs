const esbuildOptions = {
    sourcemap: 'inline'
}

module.exports = {
    testEnvironment: "@happy-dom/jest-environment",
    testMatch: ['<rootDir>/test/**/*.spec.ts'],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/src/$1",
        "^src/(.*)$": "<rootDir>/src/$1"
    },
    transform: {
        "^.+\.tsx?$": ["@swc/jest", {
            jsc: {
                parser: {
                    syntax: "typescript",
                    decorators: true
                },
                keepClassNames: true
            },
            module: {
                type: "commonjs"
            }
        }]
    }
}
