const { uniV3Export } = require('../helper/uniswapV3')

const config = {
  juchain: {
    factory: '0xEB63eBEE36Ec44a81408E101C4899020145e2daB',
    fromBlock: 15519262,
    blacklistedTokens: [
    ],
    permitFailure: true,
    sumChunkSize: 200,
  }
}

module.exports = uniV3Export(config)
