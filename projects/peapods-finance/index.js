const { sumTokens2 } = require("../helper/unwrapLPs");

const indexManager = "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B";

const indexManagerABI =
  "function allIndexes() view returns (tuple(address index, bool verified)[])";
const indexABI = { lpStakingPool: "address:lpStakingPool" };
const indexABIassets =
  "function getAllAssets() view returns (tuple(address token, uint256 weighting, uint256 basePriceUSDX96, address c1, uint256 q1)[])";
const stakingPoolABI = { stakingToken: "address:stakingToken" };

const getTvl = async (api, indexes) => {
  const ownerTokens = []

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
  return api.getBalances()
};

async function tvl(_, _b, _cb, { api, }) {
  //retrieve all available indexes
  const allIndexes = await api.call({ abi: indexManagerABI, target: indexManager, });
  //this array contains all contracts that own TVL
  const indexes = allIndexes.map(i => i.index).filter(i => i.toLowerCase() !== '0x515e7fd1C29263DFF8d987f15FA00c12cd10A49b'.toLowerCase())
  return getTvl(api, indexes)
}

async function staking(_, _b, _cb, { api, }) {
  return getTvl(api, ['0x515e7fd1C29263DFF8d987f15FA00c12cd10A49b'])
}

module.exports = {
  ethereum: {
    tvl, staking,
  },
  methodology: "Aggregates TVL in all Peapods Finance indexes created",
};
