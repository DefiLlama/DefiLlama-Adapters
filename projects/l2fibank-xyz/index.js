const { compoundV3Exports } = require('../helper/compoundV3')

module.exports = compoundV3Exports({
  arbitrum: {
    markets: [
      "0x0596355e1d3a467a7b22a9e96e5b0fba494b9f89", // USDT Market
    ],
  }
})