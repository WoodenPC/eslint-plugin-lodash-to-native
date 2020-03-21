const RuleTester = require("eslint").RuleTester;

const rule = require('../../../lib/rules/map');

function getError(message) {
  return {
    message,
  };
}

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
  }
});

ruleTester.run('lodash _.map to native', rule, {
  valid: [
    { code: '[a, b, c].map(fn)', },
    { code: '_.map({a: 1, b: 2, c: 3}, fn)' },
    { code: 'Array.isArray(collection) ? collection.map(fn) : _.map(collection, fn)' },
    {
      code: `
        const _ = someLib;
        _.map([a, b, c], fn)
      `
    },
    {
      code: `
        if (Array.isArray(collection)) {
          collection.map(fn);
        } else {
          _.map(collection, fn);
        }
      `
    }
  ],
  invalid: [
    {
      code: '_.map(collection, fn)',
      errors: [getError('Replace _.map to native code')]
    },
    {
      code: '_.map([a, b, c], fn)',
      errors: [getError('Replace _.map to native code')]
    },
    // {
    //   code: `
    //     const _ = someLib;
    //     [a, b, c].map(fn)
    //   `,
    //   errors: [getError('')]
    // }
  ]
});

