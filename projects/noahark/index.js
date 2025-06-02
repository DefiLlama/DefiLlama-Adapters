const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  eos_evm: {
    tvl: getUniTVL({ factory: '0x75782A57c6522B8B17FCc01Ff11759f4535b2752', useDefaultCoreAssets: true,  })
  }
}