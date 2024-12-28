const { cexExports } = require('../helper/cex')

// https://dune.com/21co/backpack-exchange
const config = {
  solana: {
    owners: [
      '43DbAvKxhXh1oSxkJSqGosNw3HpBnmsWiak6tB5wpecN',
      'BbHG9GvPActFGogv3iNrpDAj4qpXr8t3jF16uGxXcKci'
    ],
  },
}

module.exports = cexExports(config)