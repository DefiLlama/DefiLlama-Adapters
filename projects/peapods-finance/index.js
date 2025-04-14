const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: { indexManagerV3: "0x6eFFcF94993d6a6081204fc3C30473468Eb7666E", indexManagerV2: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", leverageManager: "0x4e6EF371C9CDDE8C3e6716AffEEBaD14C8c62D0B", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875"},
  arbitrum: { indexManagerV3: "0x64511ccE99ab01A6dD136207450eA81263b14FD8", indexManagerV2: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", leverageManager: "0x3f2257B6f1fd055aEe020027740f266127E8E2B0", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875"},
  base: { indexManagerV3: "0x556059e80CB0073D4A9547081Cf0f80cBB94ec30", indexManagerV2: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", leverageManager: "0x31E35550b15B2DFd267Edfb39Dd9F3CD1c6ab82D", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875"},
  sonic: { indexManagerV3: "0x9e054F6C328d8E424a2354af726FDc88cB166060", leverageManager: "0x0C4B19994F466ac4B6bA8F9B220d83beC6118b61", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875"},
  mode: { indexManagerV2: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875"},
};

const abi = {
  allIndexesV2: "function allIndexes() view returns (tuple(address index, bool verified)[])",
  allIndexesV3: "function allIndexes() view returns (tuple(address index, address creator, bool verified, bool selfLending, bool makePublic)[])",
  getAllAssets: "function getAllAssets() view returns (tuple(address token, uint256 weighting, uint256 basePriceUSDX96, address c1, uint256 q1)[])",
  lpStakingPool: "address:lpStakingPool",
  stakingToken: "address:stakingToken",
  pairedLPToken: "address:PAIRED_LP_TOKEN",
  lendingPair: "function lendingPairs(address input) view returns (address)"
}

const getTvl = async (api, isStaking) => {
  const { indexManagerV2, indexManagerV3, leverageManager, peasToken } = config[api.chain];
  const ownerTokens = [];
  const lendingPairsToGetAssets = [];
  const includedStakingPools = [];
  var indexesV3 = [];
  var indexesV2 = [];

  //V2 logic
  if(indexManagerV2){
    indexesV2 = ( await api.call({ abi: abi.allIndexesV2, target: indexManagerV2 })).map((i) => i.index);

    const stakingPoolsV2 = await api.multiCall({ abi: abi.lpStakingPool, calls: indexesV2 });
    const assetsResultV2 = await api.multiCall({ abi: abi.getAllAssets, calls: indexesV2 });
    const stakingTokensV2 = await api.multiCall({ abi: abi.stakingToken, calls: stakingPoolsV2 });

    assetsResultV2.forEach((assets, i) => { ownerTokens.push([assets.map((i) => i.token), indexesV2[i]]) });
    stakingTokensV2.forEach((stakingToken, i) => ownerTokens.push([[stakingToken], stakingPoolsV2[i]]));
  }

  //V3 (LVF) logic
  if(indexManagerV3){
    indexesV3 = ( await api.call({ abi: abi.allIndexesV3, target: indexManagerV3 })).map((i) => i.index);

    const stakingPoolsV3 = await api.multiCall({ abi: abi.lpStakingPool, calls: indexesV3 });
    const stakingTokensV3 = await api.multiCall({ abi: abi.stakingToken, calls: stakingPoolsV3 });
    const PAIRED_LP_TOKEN = await api.multiCall({ abi: abi.pairedLPToken, calls: indexesV3 });
    const lendingPairArray = await api.multiCall({ abi: abi.lendingPair, calls: indexesV3.map(index => ({ target: leverageManager, params: [index] })) });

    PAIRED_LP_TOKEN.forEach((tokens, i) => {
      if(lendingPairArray[i] != ADDRESSES.null){
        lendingPairsToGetAssets.push([PAIRED_LP_TOKEN[i]]);
      }else{
        includedStakingPools.push([stakingTokensV3[i], PAIRED_LP_TOKEN[i]]);
      }
    });

    const vaultTokensArray = await api.multiCall({ abi: 'function asset() view returns (address)', calls: lendingPairsToGetAssets.map(index => ({ target: index[0] })) });
    lendingPairsToGetAssets.forEach((vault, i) => { ownerTokens.push( [[vaultTokensArray[i]], vault[0]] ) });
    const assetsResultV3 = await api.multiCall({ abi: abi.getAllAssets, calls: indexesV3 });
    assetsResultV3.forEach((assets, i) => { ownerTokens.push([assets.map((i) => i.token), indexesV3[i]]) });
    includedStakingPools.forEach((stakingPool, i) => {ownerTokens.push([[stakingPool[1]], stakingPool[0]]) })
  }

  await sumTokens2({ api,ownerTokens,blacklistedTokens: [...indexesV2,...indexesV3],resolveLP: true });

  [...indexesV2,...indexesV3].forEach((i) => api.removeTokenBalance(i));
  Object.keys(api.getBalances()).forEach((token) => {
    let remove = new RegExp(peasToken, "i").test(token);
    if (isStaking) remove = !remove;
    if (remove) api.removeTokenBalance(token);
  });
  return api.getBalances();
};

module.exports = {
  methodology: "Aggregates TVL in all Peapods Finance indexes created",
  hallmarks: [[1710444951, "Arbitrum launch"],[1715151225, "Base launch"],[1715214483, "Mode launch"],[1738958400, "LVF launch"],[1742269792, "Sonic launch"]],
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => getTvl(api, false),
    staking: async (api) => getTvl(api, true),
  }
})
