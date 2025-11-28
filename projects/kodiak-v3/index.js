const { uniV3Export } = require('../helper/uniswapV3')

const factory = '0xD84CBf0B02636E7f53dB9E5e45A616E05d710990'
const fromBlock = 12314

module.exports = {
  ...uniV3Export({
    berachain: {
      factory,
      fromBlock,
      permitFailure: true
    }
  })
}