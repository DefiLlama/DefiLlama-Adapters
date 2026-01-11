const { sumTokens2 } = require("../helper/unwrapLPs");

const STAKED_LBGT_VAULT = "0xFace73a169e2CA2934036C8Af9f464b5De9eF0ca";
const BR_LBGT_ADDRESS = "0x883899D0111d69f85Fdfd19e4B89E613F231B781";
const LBGT_ADDRESS = "0xBaadCC2962417C01Af99fb2B7C75706B9bd6Babe";

const config = {
  berachain: { indexManager: "0x262619334907c70A826623CE24C38281C3dBdE13", indexManagerV1_1: "0xf4735ba574964B7754c2F165146911f03ec94D30"},
};

const abi = {
  allIndexes: "function allIndexes() view returns (tuple(address index, bool verified)[])",
  getAllAssets: "function getAllAssets() view returns (tuple(address token, uint256 weighting, uint256 basePriceUSDX96, address c1, uint256 q1)[])",
  lpStakingPool: "address:lpStakingPool",
  stakingToken: "address:stakingToken",
  pairedLPToken: "address:PAIRED_LP_TOKEN",
  convertToAssets: "function convertToAssets(uint256 shares) view returns (uint256 assets)",
}

const getTvl = async (api, isStaking) => {
  const { indexManager, indexManagerV1_1 } = config[api.chain];
  const ownerTokens = [];
  var indexes = []

  // Get all indexes
  if(indexManager){
    indexes = ( await api.call({ abi: abi.allIndexes, target: indexManager })).map((i) => i.index);

    if (indexManagerV1_1) {
      var indexesV1_1 = [];
      indexesV1_1 = ( await api.call({ abi: abi.allIndexes, target: indexManagerV1_1 })).map((i) => i.index);
      for (let i = 0; i < indexesV1_1.length; i++) {
        if (!indexes.includes(indexesV1_1[i])) {
          indexes.push(indexesV1_1[i]);
        }
      }
    }

    const stakingPools = await api.multiCall({ abi: abi.lpStakingPool, calls: indexes });
    const assetsResult = await api.multiCall({ abi: abi.getAllAssets, calls: indexes });
    const stakingTokens = await api.multiCall({ abi: abi.stakingToken, calls: stakingPools });

    assetsResult.forEach((assets, i) => { ownerTokens.push([assets.map((i) => i.token), indexes[i]]) });
    stakingTokens.forEach((stakingToken, i) => ownerTokens.push([[stakingToken], stakingPools[i]]));

    // Get LBGT in brLBGT
    const stLBGTBalance = await api.call({
        target: STAKED_LBGT_VAULT,
        abi: 'erc20:balanceOf',
        params: [BR_LBGT_ADDRESS],
    });
    const lbgtBalance = await api.call({
        target: STAKED_LBGT_VAULT,
        abi: abi.convertToAssets,
        params: [stLBGTBalance],
    });
    api.add(LBGT_ADDRESS, lbgtBalance);
  }

  await sumTokens2({ api, ownerTokens, blacklistedTokens: indexes, resolveLP: true, log: true });

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
  hallmarks: [[1743091200, "Berachain launch"], [1748383200, "Dens V1.1 + arBERO Launch"]],
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => getTvl(api, false),
    staking: async (api) => getTvl(api, true),
  }
})
