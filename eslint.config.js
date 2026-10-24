module.exports = [
    {
        files: ["**/*.js"],
        ignores: ["projects/test/*"],
        languageOptions: {
            ecmaVersion: "latest",
        },
        rules: {
            "no-case-declarations": "off",
            "no-unused-vars": "off",
            "no-useless-escape": "warn",
            "no-prototype-builtins": "off",
            "no-unreachable": "off",
        }
    },
    {
        files: ["projects/**/*.js"],
        rules: {
            "no-restricted-syntax": ["error",
                {
                    selector: 'CallExpression[callee.object.name="api"][callee.property.name="getLogs"]',
                    message: "Use the getLogs2 helper instead of api.getLogs(...).",
                },
                {
                    selector: 'CallExpression[callee.object.name="api"][callee.property.value="getLogs"]',
                    message: "Use the getLogs2 helper instead of api.getLogs(...).",
                },
            ],
        },
    }
];