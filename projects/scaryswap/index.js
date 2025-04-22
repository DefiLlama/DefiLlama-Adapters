const { getUniTVL } = require("../helper/unknownTokens");
const { pools, farms } = require("./contracts.json");
const poolAbi = require("./pool.json");
const { sumTokens2 } = require("../helper/unwrapLPs");

const chain = "fantom";

async function staking(api) {
  const tokens = await api.multiCall({  abi: poolAbi.rewardsToken, calls: pools }) 
  const tokensAndOwners = tokens.map((v, i) => [v, pools[i]])
  farms.forEach(({ token, contract}) => tokensAndOwners.push([token, contract]))
  return sumTokens2({ api, tokensAndOwners})
}

module.exports = {
  fantom: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: "0x7ceb5f3a6d1888eec74a41a5377afba5b97200ea",
    }),
    staking: staking
  },
};
