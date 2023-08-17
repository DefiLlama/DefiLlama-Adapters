const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  eos_evm: {
    tvl: getUniTVL({ factory: '0x84c81cbC482B7BDB02470bB820F5323aa77C50F3', useDefaultCoreAssets: true,  })
  }
}
