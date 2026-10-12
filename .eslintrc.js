module.exports = {
  extends: [
    'airbnb-base',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'import', 'prettier'],
  env: {
    node: true,
    es2021: true,
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'class-methods-use-this': 'off',
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    'no-useless-constructor': 'off',
    'no-empty-function': ['error', { allow: ['constructors'] }],
    'import/prefer-default-export': 'off',
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/member-ordering': 'warn',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/ban-types': [
      'error',
      {
        types: {
          Function: 'Use a specific function type instead, e.g. () => void',
        },
        extendDefaults: true,
      },
    ],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        ts: 'never',
        js: 'never',
      },
    ],
    'import/prefer-default-export': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      { devDependencies: ['**/*.spec.ts', '**/*.test.ts', 'test/**/*.ts'] },
    ],
    'import/no-cycle': 'error',
    'class-methods-use-this': 'off', // Allow class methods without `this`, common in services and controllers
    'no-useless-constructor': 'off', // Allow empty constructors for dependency injection
    'no-empty-function': ['error', { allow: ['constructors'] }], // Allow empty constructors
    '@typescript-eslint/no-namespace': 'off', // Allow using namespaces for modules
    'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
    'prettier/prettier': 'error',
    'import/no-import-module-exports': 'off',
    'import/no-extraneous-dependencies': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
  },
  ignorePatterns: ['dist', 'node_modules'],
  settings: {
    'import/resolver': {
      typescript: {},
    },
  },
};
