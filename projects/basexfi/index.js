const { uniV3Export } = require('../helper/uniswapV3')

module.exports = {
  methodology: 'TVL accounts for the liquidity on all AMM pools taken from the factory contract',
  ...uniV3Export({
    base: { factory: '0xdC323d16C451819890805737997F4Ede96b95e3e', fromBlock: 4159800 },
  })
}