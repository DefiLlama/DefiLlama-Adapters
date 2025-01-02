const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  eos_evm: {
    tvl: getUniTVL({ factory: '0xC0C6CCC0E73fcA8904596D558B73e0918A35018b', useDefaultCoreAssets: true,  })
  }
}