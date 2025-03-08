import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';
import prettier from 'eslint-plugin-prettier';
import noRelativeImportPaths from 'eslint-plugin-no-relative-import-paths';

export default tseslint.config(
    eslint.configs.recommended,
    ...tseslint.configs.strict,
    ...tseslint.configs.stylistic,
    {
        plugins: {
            prettier,
            'no-relative-import-paths': noRelativeImportPaths,
        },
        rules: {
            'quote-props': ['error', 'consistent-as-needed'],
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
            'prettier/prettier': 'error',
            'no-relative-import-paths/no-relative-import-paths': [
              'error',
              { "allowSameFolder": true, "rootDir": "src", "prefix": "" }
            ]
        },
    },
    eslintConfigPrettier,
);
