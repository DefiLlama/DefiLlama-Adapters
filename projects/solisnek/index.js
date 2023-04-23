const { getUniTVL } = require("../helper/unknownTokens");
const { staking } = require('../helper/staking');

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl: getUniTVL({ factory: '0xeeee1F1c93836B2CAf8B9E929cb978c35d46657E', useDefaultCoreAssets: true,  hasStablePools: true, stablePoolSymbol: 'ssAMM' }),
  },
};
