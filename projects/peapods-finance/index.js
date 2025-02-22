const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: { indexManager: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875" },
  arbitrum: { indexManager: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875" },
  base: { indexManager: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875", blacklist: ['0xc31389794ffac23331e0d9f611b7953f90aa5fdc'] },
  mode: { indexManager: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875" },
}

const abi = {
  allIndexes: "function allIndexes() view returns (tuple(address index, bool verified)[])",
  lpStakingPool: "address:lpStakingPool",
  getAllAssets: "function getAllAssets() view returns (tuple(address token, uint256 weighting, uint256 basePriceUSDX96, address c1, uint256 q1)[])",
  stakingToken: "address:stakingToken"
}

const getTvl = async (api, isStaking) => {
  const { indexManager, peasToken, blacklist = [] } = config[api.chain]
  const indexes = (await api.call({ abi: abi.allIndexes, target: indexManager, })).map(i =>i.index);

  // get staking pool contract for index (spp)
  const stakingPools = await api.multiCall({ abi: abi.lpStakingPool, calls: indexes, });

  //get assets this index consists of
  const assetsResult = await api.multiCall({ abi: abi.getAllAssets, calls: indexes, permitFailure: true });
  const stakingTokens = await api.multiCall({ abi: abi.stakingToken, calls: stakingPools, });

  const ownerTokens = [
    ...assetsResult.filter(assets => assets).map((assets, i) => [assets.map(asset => asset.token), indexes[i]]),
    ...stakingTokens.map((stakingToken, i) => [[stakingToken], stakingPools[i]])
  ];

  await sumTokens2({ api, ownerTokens, blacklistedTokens: [...indexes, ...blacklist], resolveLP: true });
  [...indexes, ...blacklist].forEach(i => api.removeTokenBalance(i))

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
  hallmarks: [[1710444951, "Arbitrum launch"],[1715151225, "Base launch"],[1715214483, "Mode launch"]],
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => getTvl(api, false),
    staking: async (api) => getTvl(api, true),
  }
})
