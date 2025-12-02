import agentConfig from 'eslint-config-agent'
import publishablePackageJson from 'eslint-config-publishable-package-json'

export default [
  ...agentConfig,
  publishablePackageJson,
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.mjs'],
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
      },
    },
  },
  {
    files: ['**/*.spec.ts', '**/*.test.ts'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
      'no-restricted-syntax': 'off',
      'ddd/require-spec-file': 'off',
    },
  },
  {
    // CLI tools require dynamic file operations and small utility modules
    files: ['src/commands/**/*.ts', 'src/utils/**/*.ts'],
    rules: {
      'security/detect-non-literal-fs-filename': 'off',
      'security/detect-object-injection': 'off',
      'ddd/require-spec-file': 'off',
      'no-restricted-syntax': 'off',
      'max-lines': 'off',
    },
  },
]
