const { uniV3Export } = require('../helper/uniswapV3')

const factory = '0xD84CBf0B02636E7f53dB9E5e45A616E05d710990'
const fromBlock = 12314

module.exports = {
  ...uniV3Export({
    berachain: {
      factory,
      fromBlock,
      permitFailure: true,
      blacklistedOwners: [
        '0x24619368bad314d1635a54027c5231b9b83c4a7e',
        '0xe9703de93406cc31441a57ce5d08272ed545d32b',
      ],
    }
  })
}
