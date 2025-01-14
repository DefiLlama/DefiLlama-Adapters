const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  linea: { tvl: getUniTVL({ factory: '0x6D1063F2187442Cc9adbFAD2f55A96B846FCB399', useDefaultCoreAssets: true,  }), },
}
