module.exports = [
    {
        files: ["**/*.js"],
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