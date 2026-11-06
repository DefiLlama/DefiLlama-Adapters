const { uniV3Export } = require('../helper/uniswapV3')

// https://v3.rocketswap.org/contracts
module.exports = {
  methodology: 'TVL is the value of tokens held in RocketSwap V3 liquidity pools on Anubis.',
  ...uniV3Export({
    anubi: { factory: '0xbf1b0e9878e782c799010454c1A65ACd334f666F', fromBlock: 16113175 },
  }),
}
