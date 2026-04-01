const { mergeExports } = require('../helper/utils')
const { uniV3Export } = require('../helper/uniswapV3')
const { getUniTVL } = require('../helper/unknownTokens')

const v2 = {
  stable: {
    tvl: getUniTVL({ factory: '0x25D2d657F539F2bB16eC82773cBE5ee49ddD3c69', useDefaultCoreAssets: true }),
  },
}

const v3 = uniV3Export({
  stable: {
    factory: '0x88F0a512eF09175D456bc9547f914f48C013E4aA',
    fromBlock: 18556884,
  },
})

module.exports = mergeExports([v2, v3])
