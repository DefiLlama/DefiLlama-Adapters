const rulesDirPlugin = require('eslint-plugin-rulesdir');
rulesDirPlugin.RULES_DIR = 'eslint-rules';

module.exports = {
    "env": {
        "node": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "plugins": ['rulesdir'],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
  ignorePatterns: ['projects/test/*', 'eslint-rules/*'],
    "rules": {
        "no-case-declarations": "off",
        "no-unused-vars": "off",
        "no-prototype-builtins": "off",
        "rulesdir/no-contract-address-literals": "warn",
        "rulesdir/missing-defined-addresses-require": "warn",
    }
}
