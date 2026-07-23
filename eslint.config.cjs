const nodeGlobals = {
    Buffer: 'readonly',
    URL: 'readonly',
    URLSearchParams: 'readonly',
    __dirname: 'readonly',
    __filename: 'readonly',
    clearImmediate: 'readonly',
    clearInterval: 'readonly',
    clearTimeout: 'readonly',
    console: 'readonly',
    exports: 'writable',
    global: 'readonly',
    module: 'readonly',
    process: 'readonly',
    queueMicrotask: 'readonly',
    require: 'readonly',
    setImmediate: 'readonly',
    setInterval: 'readonly',
    setTimeout: 'readonly'
};

const vitestGlobals = {
    afterAll: 'readonly',
    afterEach: 'readonly',
    beforeAll: 'readonly',
    beforeEach: 'readonly',
    describe: 'readonly',
    expect: 'readonly',
    it: 'readonly',
    test: 'readonly',
    vi: 'readonly'
};

module.exports = [
    {
        ignores: [
            'coverage/**',
            'node_modules/**',
            'uploads/**',
            '**/__snapshots__/**',
            'src/data/locations.js',
            // TODO(v2): Remove after resolving the existing duplicate declaration.
            'services/suggestions.js'
        ]
    },
    {
        files: ['**/*.js', '**/*.cjs'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'commonjs',
            globals: nodeGlobals
        },
        linterOptions: {
            reportUnusedDisableDirectives: 'off'
        },
        rules: {
            'constructor-super': 'warn',
            'getter-return': 'warn',
            'no-class-assign': 'warn',
            'no-const-assign': 'warn',
            'no-dupe-args': 'warn',
            'no-dupe-keys': 'warn',
            'no-ex-assign': 'warn',
            'no-func-assign': 'warn',
            'no-import-assign': 'warn',
            'no-new-native-nonconstructor': 'warn',
            'no-obj-calls': 'warn',
            'no-self-assign': 'warn',
            'no-setter-return': 'warn',
            'no-sparse-arrays': 'warn',
            'no-undef': 'warn',
            'no-unexpected-multiline': 'warn',
            'no-unreachable': 'warn',
            'no-unsafe-finally': 'warn',
            'use-isnan': 'warn',
            'valid-typeof': 'warn',

            'array-callback-return': 'off',
            camelcase: 'off',
            'consistent-return': 'off',
            curly: 'off',
            eqeqeq: 'off',
            'no-async-promise-executor': 'off',
            'no-await-in-loop': 'off',
            'no-console': 'off',
            'no-new': 'off',
            'no-param-reassign': 'off',
            'no-prototype-builtins': 'off',
            'no-unused-vars': 'off',
            'no-use-before-define': 'off',
            'no-var': 'off',
            'prefer-const': 'off',
            'require-await': 'off'
        }
    },
    {
        files: ['tests/**/*.js', 'vitest.config.js'],
        languageOptions: {
            globals: {
                ...nodeGlobals,
                ...vitestGlobals
            }
        }
    }
];
