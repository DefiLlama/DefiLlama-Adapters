const { cexExports } = require('../helper/cex')

const config = {
    bitcoin: {
        owners: [
            "bc1quq29mutxkgxmjfdr7ayj3zd9ad0ld5mrhh89l2",
            "3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS",
            "3MgEAFWu1HKSnZ5ZsC8qf61ZW18xrP5pgd",
            "38UmuUqPCrFmQo4khkomQwZ4VbY2nZMJ67"
        ]
    },
    ethereum: {
        owners: [
            "0xF51710015536957A01f32558402902A2D9c35d82",
            "0xd24400ae8BfEBb18cA49Be86258a3C749cf46853",
            "0x07Ee55aA48Bb72DcC6E9D78256648910De513eca",
            "0xAFCD96e580138CFa2332C632E66308eACD45C5dA",
            "0x61EDCDf5bb737ADffE5043706e7C5bb1f1a56eEA"
        ],
    },
}

module.exports = {
    ...cexExports(config), methodology: 'https://www.gemini.com/trust-center/'
}
