const { getUniTVL } = require('../helper/unknownTokens');
const { stakings } = require("../helper/staking");
const sdk = require('@defillama/sdk')
const factv1=getUniTVL({ factory: '0xF5719b1Ea3C9bF6491E22C49379E31060d0FbFc1', useDefaultCoreAssets: true, hasStablePools: true });
const factv2=getUniTVL({ factory: '0xE140EaC2bB748c8F456719a457F26636617Bb0E9', useDefaultCoreAssets: true, hasStablePools: true });

module.exports = {
  misrepresentedTokens: true,
  era: {
    tvl: sdk.util.sumChainTvls([factv1, factv2]),
    staking: stakings(["0xbdE345771Eb0c6adEBc54F41A169ff6311fE096F"], ["0x85D84c774CF8e9fF85342684b0E795Df72A24908"])
  },
  methodology: "Counts liquidity in pools",
};