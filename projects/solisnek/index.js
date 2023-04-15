const { getUniTVL } = require("../helper/unknownTokens");
const { staking } = require('../helper/staking');

module.exports = {
  misrepresentedTokens: true,
  avax: {
    tvl: getUniTVL({ factory: '0xeeee1F1c93836B2CAf8B9E929cb978c35d46657E', useDefaultCoreAssets: true, fetchBalances: true, hasStablePools: true, stablePoolSymbol: 'ssAMM' }),
    staking: staking("0xeeee3Bf0E550505C0C17a8432065F2f6b9D06350", "0xeeee99b35Eb6aF5E7d76dd846DbE4bcc0c60cA1d"),
  },
};
