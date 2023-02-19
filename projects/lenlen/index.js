
const { compoundV3Exports } = require('../helper/compoundV3')

const markets = [
  "0xc9C1B486bB027cD7023019ADA41F17109eE6c722", // USDT Market
]

const collaterals = [
  '0x1db6cdc620388a0b6046b20cd59503a0839adcff',
]

module.exports = compoundV3Exports({
  vision: {
    markets, collaterals,
  }
})