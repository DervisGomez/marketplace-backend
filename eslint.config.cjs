const babelParser = require('@babel/eslint-parser');
const eslintJs = require('@eslint/js');

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
            'dist/**',
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
            'constructor-super': 'error',
            'getter-return': 'error',
            'no-class-assign': 'error',
            'no-const-assign': 'error',
            'no-dupe-args': 'error',
            'no-dupe-keys': 'error',
            'no-ex-assign': 'error',
            'no-func-assign': 'error',
            'no-import-assign': 'error',
            'no-new-native-nonconstructor': 'error',
            'no-obj-calls': 'error',
            'no-self-assign': 'error',
            'no-setter-return': 'error',
            'no-sparse-arrays': 'error',
            'no-undef': 'error',
            'no-unexpected-multiline': 'error',
            'no-unreachable': 'error',
            'no-unsafe-finally': 'error',
            'use-isnan': 'error',
            'valid-typeof': 'error',

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
        files: ['src/**/*.ts'],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: nodeGlobals,
            parser: babelParser,
            parserOptions: {
                requireConfigFile: false,
                babelOptions: {
                    parserOpts: {
                        plugins: ['typescript']
                    }
                }
            }
        },
        linterOptions: {
            reportUnusedDisableDirectives: 'error'
        },
        rules: {
            ...eslintJs.configs.recommended.rules,
            'constructor-super': 'error',
            'getter-return': 'error',
            'no-class-assign': 'error',
            'no-const-assign': 'error',
            'no-dupe-args': 'error',
            'no-dupe-keys': 'error',
            'no-ex-assign': 'error',
            'no-func-assign': 'error',
            'no-import-assign': 'error',
            'no-new-native-nonconstructor': 'error',
            'no-obj-calls': 'error',
            'no-self-assign': 'error',
            'no-setter-return': 'error',
            'no-sparse-arrays': 'error',
            'no-unexpected-multiline': 'error',
            'no-unreachable': 'error',
            'no-unsafe-finally': 'error',
            'use-isnan': 'error',
            'valid-typeof': 'error',

            complexity: ['warn', 25],
            'no-unused-vars': 'off',
            'no-undef': 'off'
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
