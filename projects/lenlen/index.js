const ADDRESSES = require('../helper/coreAssets.json')

const { compoundV3Exports } = require('../helper/compoundV3')

const markets = [
  "0xc9C1B486bB027cD7023019ADA41F17109eE6c722", // USDT Market
]

const collaterals = [
  ADDRESSES.vision.USDT,
]

module.exports = compoundV3Exports({
  vision: {
    markets, collaterals,
  }
})