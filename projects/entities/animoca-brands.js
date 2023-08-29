const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0xd6AF301A8770659c1Dc880843db4d1aaA01048b4",
        "0xE929c67Db94f5b1541FB241eB3E5CbC6468c37e6", //binance deposited account
    ],
  },
}

module.exports = cexExports(config)