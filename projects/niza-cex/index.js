const { cexExports } = require('../helper/cex')

const config = {
  bitcoin: {
    owners: [
      'bc1qx2p4hx3s60cg69rt3j78l2vskelgcjj95s5ty3'
    ]
  },
  ethereum: {
    owners: [
      '0x8374F37B298420ae13ccD3cbE7dC07895290676d'
    ]
  }
}

module.exports = cexExports(config)
