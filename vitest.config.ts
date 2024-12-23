import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        name: "sleekgrid",
        environment: "jsdom",
        browser: {
            provider: 'playwright',
            instances: [{
                browser: "chromium",
            }]
        },
        globals: true
    }
})
