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
    }
];