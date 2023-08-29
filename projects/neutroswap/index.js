const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  eos_evm: {
    tvl: getUniTVL({ factory: '0x2140AB15bfdfa3fa1037DB7204a92429f816794D', useDefaultCoreAssets: true,  })
  }
}