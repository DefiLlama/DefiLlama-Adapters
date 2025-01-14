const { sumTokens2 } = require("../helper/unwrapLPs")

module.exports = {
  sophon: {
    tvl,
  },
}

async function tvl(api) {
  const farm = '0x5753fBeC29De6E2b56F73f7d7786e9f0d34897bb'
  const pools = await api.call({  abi: "function getPoolInfo() view returns ((address lpToken, address l2Farm, uint256 amount, uint256 boostAmount, uint256 depositAmount, uint256 allocPoint, uint256 lastRewardBlock, uint256 accPointsPerShare, uint256 totalRewards, string description)[] poolInfos)", target: farm})
  const tokens = pools.map(i => i.lpToken)
  return sumTokens2({ owner: farm, tokens, api, })
}