const { sumTokens2 } = require("../helper/unwrapLPs")

const contracts = {
  sophon: '0x5753fBeC29De6E2b56F73f7d7786e9f0d34897bb',
  ethereum: '0xeff8e65ac06d7fe70842a4d54959e8692d6ae064',
}

module.exports = {
  sophon: {
    tvl: async (api) => getTvl(api, contracts.sophon),
  },
  ethereum: {
    tvl: async (api) => getTvl(api, contracts.ethereum),
  },
  hallmarks: [
    [1718733600, "Season 1: Launch of the farm on Ethereum"],
    [1735334250, "Season 2: Migration of the farm to Sophon"]
  ]
}

async function getTvl(api, farm) {
  const pools = await api.call({  abi: "function getPoolInfo() view returns ((address lpToken, address l2Farm, uint256 amount, uint256 boostAmount, uint256 depositAmount, uint256 allocPoint, uint256 lastRewardBlock, uint256 accPointsPerShare, uint256 totalRewards, string description)[] poolInfos)", target: farm})
  const tokens = pools.map(i => i.lpToken)
  return sumTokens2({ owner: farm, tokens, api, })
}