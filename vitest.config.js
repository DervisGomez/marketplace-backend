const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
    test: {
        globals: true,
        setupFiles: ['./tests/helpers/setup.js'],
        testTimeout: 30000,
        hookTimeout: 120000,
        poolOptions: {
            threads: { singleThread: true }
        }
    }
});
