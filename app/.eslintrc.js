module.exports = {
  // https://eslint.org/docs/user-guide/configuring#configuration-cascading-and-hierarchy
  // This option interrupts the configuration hierarchy at this file
  root: true,

  parserOptions: {
    parser: 'babel-eslint',
    sourceType: 'module', // Allows for the use of imports
  },

  // https://eslint.org/docs/user-guide/configuring#specifying-environments
  env: {
    browser: true,
    es2021: true,
  },

  // Rules order is important, please avoid shuffling them
  extends: [
    // Base ESLint recommended rules
    'eslint:recommended',
    'airbnb-base',

    // Uncomment any of the lines below to choose desired strictness,
    // but leave only one uncommented!
    // See https://eslint.vuejs.org/rules/#available-rules
    // 'plugin:vue/essential', // Priority A: Essential (Error Prevention)
    // 'plugin:vue/strongly-recommended' // Priority B: Strongly Recommended (Improving Readability)
    'plugin:vue/recommended', // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)

    // https://github.com/prettier/eslint-config-prettier#installation
    // usage with Prettier, provided by 'eslint-config-prettier'.
    // 'prettier',

    // 'prettier/vue',
  ],

  plugins: [
    // https://eslint.vuejs.org/user-guide/#why-doesn-t-it-work-on-vue-file
    // required to lint *.vue files
    'vue',

    // https://github.com/typescript-eslint/typescript-eslint/issues/389#issuecomment-509292674
    // Prettier has not been included as plugin to avoid performance impact
    // add it as an extension for your IDE
  ],

  globals: {
    ga: true, // Google Analytics
    cordova: true,
    __statics: true,
    process: true,
    Capacitor: true,
    chrome: true,
  },

  // add your custom rules here
  rules: {
    /**
     * Require or disallow semicolons instead of ASI
     * https://eslint.org/docs/rules/semi
     */
    semi: ['error', 'never'],

    /**
     * Enforce consistent indentation
     * https://eslint.org/docs/rules/indent
     */
    indent: ['error', 2],

    /**
     * Require parens in arrow function arguments
     * https://eslint.org/docs/rules/arrow-parens
     */
    'arrow-parens': ['warn', 'always'],

    /**
     * Disallow Assignment in return Statement
     * https://eslint.org/docs/rules/no-return-assign
     */
    'no-return-assign': ['warn', 'except-parens'],

    /**
     * Disallow Unused Variables
     * https://eslint.org/docs/rules/no-unused-vars
     */
    'no-unused-vars': ['warn'],

    /**
     * Require or disallow named `function` expressions
     * https://eslint.org/docs/rules/func-names
     */
    'func-names': 'off',

    /**
     * Disallow the use of console
     * https://eslint.org/docs/rules/no-console
     */
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    /**
     * Disallow the use of debugger
     * https://eslint.org/docs/rules/no-debugger
     */
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',

    /**
     * Disallow registering components that are not used inside templates
     * https://eslint.vuejs.org/rules/no-unused-components.html
     */
    'vue/no-unused-components': 'warn',

    /**
     * Forbid the use of extraneous packages
     * https://github.com/benmosher/eslint-plugin-import/blob/master/docs/rules/no-extraneous-dependencies.md
     */
    'import/no-extraneous-dependencies': 'off',

    /**
     * Enforce a convention in module import order
     * https://github.com/benmosher/eslint-plugin-import/blob/v2.22.1/docs/rules/order.md
     */
    'import/order': ['warn', { 'newlines-between': 'always' }],

    /**
     * Ensures an imported module can be resolved to a module on the local filesystem
     * https://github.com/benmosher/eslint-plugin-import/blob/v2.22.1/docs/rules/no-unresolved.md
     */
    'import/no-unresolved': 'off',
  },
}
