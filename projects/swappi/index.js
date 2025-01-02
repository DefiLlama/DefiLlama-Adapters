const { getUniTVL } = require('../helper/unknownTokens');

module.exports = {
  misrepresentedTokens: true,
  conflux: {
    tvl: getUniTVL({ useDefaultCoreAssets: true, factory: '0xe2a6f7c0ce4d5d300f97aa7e125455f5cd3342f5'}),
  }
} 