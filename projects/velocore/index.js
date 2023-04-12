const { getUniTVL } = require('../helper/unknownTokens');
const sdk = require('@defillama/sdk')
const factv1=getUniTVL({ factory: '0xF5719b1Ea3C9bF6491E22C49379E31060d0FbFc1', useDefaultCoreAssets: true, hasStablePools: true });
const factv2=getUniTVL({ factory: '0xE140EaC2bB748c8F456719a457F26636617Bb0E9', useDefaultCoreAssets: true, hasStablePools: true });
module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: sdk.util.sumChainTvls([factv1, factv2]),
  },
  methodology: "Counts liquidity in pools",
};