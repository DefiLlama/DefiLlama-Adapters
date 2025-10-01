const { cexExports } = require('../helper/cex')

const config = {
  ripple: {
    owners:[
        "rpWpGbeMQSQLhitEHVtfTrArByj3xh5Rt1",  // core vault
        "rDvuj6yYU6sT1waeaqW2f2pVQkvDUaDKrg",  // escrow
        "rfkXSaCZKTg1EZzec2rLDyrWHxRVJdtVXj",  // escrow
    ]
  },
  flare: {
    // https://fassets.au.cc/pools
    owners: ['0xe56f464c23760d563dd4c73dADA05159aE71FC50', '0xA69bF2eC0eF91A29B5da634BD4958AA32BaD9fe3', '0x7CeC6EC27F3A0f0a37B1847E5Af3E99A7499A0bC', '0x0F6AB40fE44aA3AB15B8ff96Df98C6F5865F048E', '0x8eA74D78A03F20597cEE115176f7f8b65271c87A'],
    tokens: ['0xe7cd86e13AC4309349F30B3435a9d337750fC82D'], // USDT0
  }
}

module.exports = cexExports(config)

module.exports.methodology = "Value of XRP & USDT held in the core vault and the escrows";