const RuleTester = require("eslint").RuleTester;

const { rules } = require('../../../lib');

const rule = rules['map'];
const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  }
});

ruleTester.run('check if first arg is Array', rule, {
  valid: [
    ''
  ],
  invalid: [
    {
      code: '_.map(collection, fn)',
      invalid: 'incorrect function call'
    }
  ]
});

