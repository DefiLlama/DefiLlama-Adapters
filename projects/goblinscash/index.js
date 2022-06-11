const sdk = require('@defillama/sdk');
const { staking, stakingPricedLP } = require("../helper/staking");
const { calculateUsdUniTvlPairs } = require('../helper/getUsdUniTvl')

const goblinStaking = "0x48B8aCe692ad8BD2E3139C65bFf7d28c048F8f00";
const GOB = "0x56381cB87C8990971f3e9d948939e1a95eA113a3";
const WBCH = "0x3743eC0673453E5009310C727Ba4eaF7b3a1cc04"

const treasuryAddress = "0x259D4CBA522A15AA5Db641D0E06d6f7Aa040D89f";
const flexUSD = "0x7b2B3C5308ab5b2a1d9a94d20D35CCDf61e05b72";
const GOB_flexUSD_MLP = "0xC20A4f3012bA2Df47544d4926B19604Fa777FB01";
const GOB_BCH_MLP = "0x86b0fd64234a747681f0235b6cc5fe04a4d95b31";
const CHAIN = "smartbch"

const flexUsdTVL = calculateUsdUniTvlPairs([GOB_flexUSD_MLP], CHAIN, flexUSD, [GOB], "flex-usd", 18)
const bchTVL = calculateUsdUniTvlPairs([GOB_BCH_MLP], CHAIN, WBCH, [GOB], "bitcoin-cash", 18)
const flexUsdTreasuryTVL = staking(treasuryAddress, flexUSD, CHAIN, "flex-usd", 18)

module.exports = {
  misrepresentedTokens: true,
  smartbch: {
    staking: stakingPricedLP(goblinStaking, GOB, CHAIN, GOB_flexUSD_MLP, "flex-usd", false, 18),
    tvl: sdk.util.sumChainTvls([flexUsdTVL, bchTVL, flexUsdTreasuryTVL])
  },
  methodology:
    "Counts flexUSD and MistSwap's LP tokens (GOB-flexUSD, GOB-WBCH) on the treasury contract towards TVL and staked GOB tokens towards staking",
};
