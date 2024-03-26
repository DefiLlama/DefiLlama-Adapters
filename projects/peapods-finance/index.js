const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: { indexManager: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875" },
  arbitrum: { indexManager: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875" },
}

const indexManagerABI =
  "function allIndexes() view returns (tuple(address index, bool verified)[])";
const indexABI = { lpStakingPool: "address:lpStakingPool" };
const indexABIassets =
  "function getAllAssets() view returns (tuple(address token, uint256 weighting, uint256 basePriceUSDX96, address c1, uint256 q1)[])";
const stakingPoolABI = { stakingToken: "address:stakingToken" };

const getTvl = async (api, isStaking) => {
  const { indexManager, peasToken } = config[api.chain]
  const ownerTokens = []
  const indexes = (await api.call({ abi: indexManagerABI, target: indexManager, })).map(i =>i.index);

  //get staking pool contract for index (spp)
  const stakingPools = await api.multiCall({ abi: indexABI.lpStakingPool, calls: indexes, });

  //get assets this index consists of
  const assetsResult = await api.multiCall({ abi: indexABIassets, calls: indexes, });
  const stakingTokens = await api.multiCall({ abi: stakingPoolABI.stakingToken, calls: stakingPools, });

  assetsResult.forEach((assets, i) => {
    ownerTokens.push([assets.map(i => i.token), indexes[i]])
  })
  stakingTokens.forEach((stakingToken, i) => ownerTokens.push([[stakingToken], stakingPools[i]]))
  await sumTokens2({ api, ownerTokens, blacklistedTokens: indexes, resolveLP: true, })
  indexes.forEach(i => api.removeTokenBalance(i))
  Object.keys(api.getBalances()).forEach(token => {
    let remove = (new RegExp(peasToken, "i")).test(token)
    if (isStaking) remove = !remove
    if (remove)
      api.removeTokenBalance(token)
  })
  return api.getBalances()
};

module.exports = {
  methodology: "Aggregates TVL in all Peapods Finance indexes created",
  hallmarks: [[1710444951, "Arbitrum launch"]],
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => getTvl(api, false),
    staking: async (api) => getTvl(api, true),
  }
})
