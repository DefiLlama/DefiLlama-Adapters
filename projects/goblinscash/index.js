const ADDRESSES = require('../helper/coreAssets.json')
const { sumUnknownTokens } = require('../helper/unknownTokens')
const { stakingPriceLP } = require("../helper/staking");

const goblinStaking = "0x48B8aCe692ad8BD2E3139C65bFf7d28c048F8f00";
const GOB = "0x56381cB87C8990971f3e9d948939e1a95eA113a3";

const treasuryAddress = "0x259D4CBA522A15AA5Db641D0E06d6f7Aa040D89f";
const flexUSD = ADDRESSES.smartbch.flexUSD;
const GOB_flexUSD_MLP = "0xC20A4f3012bA2Df47544d4926B19604Fa777FB01";
const GOB_BCH_MLP = "0x86b0fd64234a747681f0235b6cc5fe04a4d95b31";
const chain = "smartbch"

module.exports = {
  misrepresentedTokens: true,
  smartbch: {
    staking: stakingPriceLP(goblinStaking, GOB, GOB_flexUSD_MLP, "flex-usd", false, 18),
    tvl: async (_, _b, { [chain]: block }) => {
      return sumUnknownTokens({ chain, block, owner:treasuryAddress, tokens: [GOB_flexUSD_MLP, GOB_BCH_MLP, flexUSD], useDefaultCoreAssets: true })
    }
  },
  methodology:
    "Counts flexUSD and MistSwap's LP tokens (GOB-flexUSD, GOB-WBCH) on the treasury contract towards TVL and staked GOB tokens towards staking",
};
