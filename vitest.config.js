const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
    test: {
        globals: true,
        setupFiles: ['./tests/helpers/setup.js'],
        testTimeout: 30000,
        hookTimeout: 120000,
        poolOptions: {
            threads: { singleThread: true }
        },
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*.js'],
            exclude: ['src/modules/**/domain/**', 'src/modules/**/application/ports/**']
        }
    }
});
