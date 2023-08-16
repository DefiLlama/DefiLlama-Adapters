const { cexExports } = require('../helper/cex')

const config = {
  ethereum: {
    owners: [
        "0x3105889390F894F8ee1d3f8f75E2c4dde57735bA"
    ],
  },
  bsc: {
    owners: [
        "0x3105889390F894F8ee1d3f8f75E2c4dde57735bA"
    ],
  },
}

module.exports = cexExports(config)