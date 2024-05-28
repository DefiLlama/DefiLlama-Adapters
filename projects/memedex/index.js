const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  conflux: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0x62283c20Ac4c7B1E61BB3C27bE2fA0880ee982Ea'}),
  }
} 