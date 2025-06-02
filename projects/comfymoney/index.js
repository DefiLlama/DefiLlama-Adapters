const { sumTokens2, } = require("../helper/unwrapLPs");
const { staking } = require("../helper/staking");

const comfyTokenAddress = "0x702f78E81Cf3DfaE89648b5a9e2e1aa8db1De546";
const cshareTokenAddress = "0x3CB98cacd44Ee77eb35E99EB74Ace91bF550c964";
const comfyRewardPoolAddress = "0x893F07c9E10932349b01Db7A3833Fe756C2D59A8";
const cshareRewardPoolAddress = "0x53efc025d19270b899eBf89DD89a1F58CE1CD66f";
const zenDenAddress = "0x108426718E67da46e09E841bC4e8430A824BDaFc";

const comfyWoneLp = "0xF2d9E493a280545699E3C07aEe22eaE9EF24DDb7";
const cshareWoneLp = "0x8fd44A4fB89e26A97B0eDf99535236D415D03E50";

const allLpPools = [
  { poolAddress: comfyRewardPoolAddress, tokenAddress: comfyWoneLp },
  { poolAddress: cshareRewardPoolAddress, tokenAddress: cshareWoneLp },
  { poolAddress: cshareRewardPoolAddress, tokenAddress: comfyWoneLp },
];

async function calcPool2(api) {
  return sumTokens2({ api, tokensAndOwners: allLpPools.map(i => ([i.tokenAddress, i.poolAddress, ])), resolveLP: true, })
}

async function onePool2(api) {
  return calcPool2(api);
}

module.exports = {
  methodology:
    "Pool2 deposits consist of COMFY/ONE and CSHARE/ONE LP tokens deposited in the MasterChef based contracts, whilst the staking TVL consists of the CSHARE tokens locked within the Zen Den contract(0x108426718E67da46e09E841bC4e8430A824BDaFc).",
  harmony: {
    tvl: async () => ({}),
    pool2: onePool2,
    staking: staking(zenDenAddress, cshareTokenAddress),
  },
};
