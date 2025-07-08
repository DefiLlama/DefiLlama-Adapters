const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  scroll: { tvl: getUniTVL({ factory: '0xb11826635f9253Bae9C426862b0f100950a71f8f', useDefaultCoreAssets: true,  }), },
}