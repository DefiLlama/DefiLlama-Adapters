const { getUniTVL } = require('../helper/unknownTokens')
const { uniV3Export } = require('../helper/uniswapV3')
const { mergeExports } = require('../helper/utils')

const export1 = {
  methodology: 'TVL includes Zebra V1 and V2',
  scroll: {
    tvl: getUniTVL({ factory: '0xa63eb44c67813cad20A9aE654641ddc918412941', useDefaultCoreAssets: true, })
  }
}

const export2 = uniV3Export({
  scroll: { factory: '0x96a7F53f7636c93735bf85dE416A4Ace94B56Bd9', fromBlock: 810032, },
})

module.exports = mergeExports([export1, export2])