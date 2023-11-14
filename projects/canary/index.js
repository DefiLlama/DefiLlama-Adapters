const { getUniTVL } = require('../helper/unknownTokens')
module.exports = {
  misrepresentedTokens: true,
  avax:{
    tvl: getUniTVL({ chain: 'avax', useDefaultCoreAssets: true, factory: '0xCFBA329d49C24b70F3a8b9CC0853493d4645436b', }),
  },
  scroll:{
    tvl: getUniTVL({ chain: 'scroll', useDefaultCoreAssets: true, factory: '0x8D88e48465F30Acfb8daC0b3E35c9D6D7d36abaf', }),
  },
}
