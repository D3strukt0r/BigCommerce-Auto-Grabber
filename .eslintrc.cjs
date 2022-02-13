// https://eslint.org/docs/user-eguide/configuring/
const config = {
    root: true,
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-requiring-type-checking',
        'airbnb-base',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: ['./tsconfig.json'],
        ecmaVersion: 'latest',
        sourceType: 'module',
    },
    plugins: ['@typescript-eslint', 'import'],
    rules: {
        'no-console': 'off',
        'import/no-unresolved': 'error', // turn on errors for missing imports
        'import/extensions': 'off',
        'no-restricted-syntax': [
            'off',
            {
                selector: 'ForOfStatement',
            },
        ],
    },
    settings: {
        'import/parsers': {
            '@typescript-eslint/parser': ['.ts', '.tsx'],
        },
        'import/resolver': {
            node: {
                extensions: ['.js', '.ts'],
            },

            typescript: {
                // always try to resolve types under `<root>@types` directory
                // even it doesn't contain any source code, like `@types/unist`
                alwaysTryTypes: true,
            },
        },
    },
    env: {
        browser: true,
        node: true,
        es2022: true,
        greasemonkey: true,
    },
    ignorePatterns: ['*.cjs', 'src/**/*.test.ts'],
};

module.exports = config;
