module.exports = {
    "env": {
        "node": true,
        "commonjs": true,
        "es2021": true
    },
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest"
    },
    ignorePatterns: ['projects/test/*'],
    "rules": {
        "no-case-declarations": "off",
        "no-unused-vars": "off",
        "no-useless-escape": "warn",
        "no-prototype-builtins": "off",
        "no-unreachable": "off",
    }
}
