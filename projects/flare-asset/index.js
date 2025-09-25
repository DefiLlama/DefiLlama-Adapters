const { cexExports } = require('../helper/cex')

const config = {
  ripple: {
    owners:[
        "rpWpGbeMQSQLhitEHVtfTrArByj3xh5Rt1",  // core vault
        "rDvuj6yYU6sT1waeaqW2f2pVQkvDUaDKrg",  // escrow
    ]
  },
}

module.exports = cexExports(config)

module.exports.methodology = "Value of XRP held in the core vault and escrow wallet";