module.exports = {
  env: {
    browser: true,
    commonjs: true,
    es6: true,
    mocha: true,
  },
  extends: [
    'standard'
  ],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly'
  },
  parserOptions: {
    ecmaVersion: 2018
  },
  rules: {
    quotes: [
      "error",
      "single"
    ],
    semi: [
      "error",
      "always"
    ],
  }
}
