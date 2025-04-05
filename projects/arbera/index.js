const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  berachain: { indexManager: "0x262619334907c70A826623CE24C38281C3dBdE13"},
};

const abi = {
  allIndexes: "function allIndexes() view returns (tuple(address index, bool verified)[])",
  getAllAssets: "function getAllAssets() view returns (tuple(address token, uint256 weighting, uint256 basePriceUSDX96, address c1, uint256 q1)[])",
  lpStakingPool: "address:lpStakingPool",
  stakingToken: "address:stakingToken",
  pairedLPToken: "address:PAIRED_LP_TOKEN",
}

const getTvl = async (api, isStaking) => {
  const { indexManager } = config[api.chain];
  const ownerTokens = [];
  var indexes = []

  //V2 logic
  if(indexManager){
    indexes = ( await api.call({ abi: abi.allIndexes, target: indexManager })).map((i) => i.index);

    const stakingPools = await api.multiCall({ abi: abi.lpStakingPool, calls: indexes });
    const assetsResult = await api.multiCall({ abi: abi.getAllAssets, calls: indexes });
    const stakingTokens = await api.multiCall({ abi: abi.stakingToken, calls: stakingPools });

    assetsResult.forEach((assets, i) => { ownerTokens.push([assets.map((i) => i.token), indexes[i]]) });
    stakingTokens.forEach((stakingToken, i) => ownerTokens.push([[stakingToken], stakingPools[i]]));
  }

  await sumTokens2({ api, ownerTokens, blacklistedTokens: indexes, resolveLP: true });

  indexes.forEach((i) => api.removeTokenBalance(i));
  Object.keys(api.getBalances()).forEach((token) => {
    let remove = false;
    if (isStaking) remove = !remove;
    if (remove) api.removeTokenBalance(token);
  });
  return api.getBalances();
};

module.exports = {
  methodology: "Aggregates TVL in all Arbera indexes created",
  hallmarks: [[1743091200, "Berachain launch"]],
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => getTvl(api, false),
    staking: async (api) => getTvl(api, true),
  }
})
