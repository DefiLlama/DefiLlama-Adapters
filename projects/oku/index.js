const { uniV3Export } = require('../helper/uniswapV3')
const factory = '0x75FC67473A91335B5b8F8821277262a13B38c9b3'
module.exports = uniV3Export({
  rbn: { factory, fromBlock: 2286057, methodology: 'TVL accounts for the liquidity on all AMM pools taken from the factory contract', permitFailure: true },
})