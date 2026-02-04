const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0x30F317A9EC0f0D06d5de0f8D248Ec3506b7E4a8A'

module.exports = uniV3Export({
  xdc: { factory, fromBlock: 59782067, methodology: 'TVL accounts for the liquidity on all AMM pools taken from the factory contract', permitFailure: true },
})