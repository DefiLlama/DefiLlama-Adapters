const { uniV3Export } = require('../helper/uniswapV3')

module.exports = {
  methodology: 'TVL accounts for the liquidity on all AMM pools taken from the factory contract',
  ...uniV3Export({
    base: { factory: '0x38015d05f4fec8afe15d7cc0386a126574e8077b', fromBlock: 3152527 },
  })
}
