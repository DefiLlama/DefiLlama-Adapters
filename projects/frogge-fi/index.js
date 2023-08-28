const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  eos_evm: {
    tvl: getUniTVL({ factory: '0xe725dDEBfc425b9AfF7e4fcA094ac9f4dcA35C89', useDefaultCoreAssets: true,  })
  }
}
