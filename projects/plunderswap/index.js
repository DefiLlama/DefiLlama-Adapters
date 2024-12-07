const { uniTvlExport, } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')

module.exports = uniTvlExport('zilliqa', '0xf42d1058f233329185A36B04B7f96105afa1adD2')
module.exports = uniV3Export({
    zilliqa: { factory: '0x000A3ED861B2cC98Cc5f1C0Eb4d1B53904c0c93a', fromBlock: 3862851, },
  })

