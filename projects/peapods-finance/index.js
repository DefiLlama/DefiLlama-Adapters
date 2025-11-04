const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require("../helper/unwrapLPs");

const config = {
  ethereum: { indexManagerV3: "0x6eFFcF94993d6a6081204fc3C30473468Eb7666E", indexManagerV2: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", leverageManager: "0x4e6EF371C9CDDE8C3e6716AffEEBaD14C8c62D0B", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875"},
  arbitrum: { indexManagerV3: "0x64511ccE99ab01A6dD136207450eA81263b14FD8", indexManagerV2: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", leverageManager: "0x3f2257B6f1fd055aEe020027740f266127E8E2B0", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875"},
  base: { indexManagerV3: "0x556059e80CB0073D4A9547081Cf0f80cBB94ec30", indexManagerV2: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", leverageManager: "0x31E35550b15B2DFd267Edfb39Dd9F3CD1c6ab82D", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875"},
  sonic: { indexManagerV3: "0x9e054F6C328d8E424a2354af726FDc88cB166060", leverageManager: "0x0C4B19994F466ac4B6bA8F9B220d83beC6118b61", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875"},
  berachain: { indexManagerV3: "0xC9260cE495B5EeC77219Bf4faCCf27EeFD932f01", leverageManager: "0x0ff519EEEc6f1C362A76F87fef3B4a3997bF5a69", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875"},
  mode: { indexManagerV2: "0x0Bb39ba2eE60f825348676f9a87B7CD1e3B4AE6B", peasToken: "0x02f92800F57BCD74066F5709F1Daa1A4302Df875"},
};

const abi = {
  allIndexesV2: "function allIndexes() view returns (tuple(address index, bool verified)[])",
  allIndexesV3: "function allIndexes() view returns (tuple(address index, address creator, bool verified, bool selfLending, bool makePublic)[])",
  getAllAssets: "function getAllAssets() view returns (tuple(address token, uint256 weighting, uint256 basePriceUSDX96, address c1, uint256 q1)[])",
  lpStakingPool: "address:lpStakingPool",
  stakingToken: "address:stakingToken",
  pairedLPToken: "address:PAIRED_LP_TOKEN",
  lendingPair: "function lendingPairs(address input) view returns (address)",
  indexManager: "function allIndexes() view returns (tuple(address index, address creator, bool verified, bool selfLending, bool makePublic)[])",
  asset: 'function asset() view returns (address)',
  previewAddInterest: 'function previewAddInterest() view returns (uint256 interestEarned, uint256 feesAmount, uint256 feesShare, (uint32 lastBlock, uint32 feeToProtocolRate, uint64 lastTimestamp, uint64 ratePerSec, uint64 fullUtilizationRate) newCurrentRateInfo, (uint128 amount, uint128 shares) totalAsset, (uint128 amount, uint128 shares) totalBorrow)'
}

async function discoverLendingPairs (api) {
  const { indexManagerV3, leverageManager } = config[api.chain];
  if (!indexManagerV3) return [];

  const pods = await api.call({ target: indexManagerV3, abi: abi.indexManager, chain: api.chain });
  if (!pods.length) return [];

  return (await api.multiCall({ calls: pods.map(pod => ({ target: leverageManager, params: [pod.index] })), chain: api.chain, abi: abi.lendingPair }))
    .filter(addr => addr !== ADDRESSES.null)
}


const getTvl = async (api, isStaking) => {
  const { indexManagerV2, indexManagerV3, leverageManager, peasToken } = config[api.chain];
  const ownerTokens = [];
  let indexesV3 = [];
  let indexesV2 = [];

  // V2 logic
  if (indexManagerV2) {
    indexesV2 = ( await api.call({ abi: abi.allIndexesV2, target: indexManagerV2 })).map((i) => i.index);

    if (indexesV2.length) {
      const [stakingPoolsV2, assetsResultV2] = await Promise.all([
        api.multiCall({ abi: abi.lpStakingPool, calls: indexesV2 }),
        api.multiCall({ abi: abi.getAllAssets,  calls: indexesV2 }),
      ]);

      const stakingTokensV2 = await api.multiCall({ abi: abi.stakingToken, calls: stakingPoolsV2 });

      ownerTokens.push(
        ...assetsResultV2.map((assets, i) => [assets.map(a => a.token), indexesV2[i]]),
        ...stakingTokensV2.map((stakingToken, i) => [[stakingToken], stakingPoolsV2[i]]),
      );
    }
  }

  // V3 (LVF) logic
  if (indexManagerV3) {
    indexesV3 = ( await api.call({ abi: abi.allIndexesV3, target: indexManagerV3 })).map((i) => i.index);

    if (indexesV3.length) {
      const [stakingPoolsV3, pairedLpTokens, assetsResultV3, lendingPairArray] = await Promise.all([
        api.multiCall({ abi: abi.lpStakingPool, calls: indexesV3 }),
        api.multiCall({ abi: abi.pairedLPToken, calls: indexesV3 }),
        api.multiCall({ abi: abi.getAllAssets, calls: indexesV3 }),
        api.multiCall({ abi: abi.lendingPair, calls: indexesV3.map((index) => ({ target: leverageManager, params: [index] })) }),
      ]);

      const stakingTokensV3 = await api.multiCall({ abi: abi.stakingToken, calls: stakingPoolsV3 });

      const lendingIdx = lendingPairArray.map((addr, i) => (addr !== ADDRESSES.null ? i : null)).filter(i => i !== null);
      const stakingIdx = lendingPairArray.map((addr, i) => (addr === ADDRESSES.null ? i : null)).filter(i => i !== null);
      const lendingPairs = lendingIdx.map(i => lendingPairArray[i]);
      const vaultTokens = lendingPairs.length ? await api.multiCall({ abi: abi.asset, calls: lendingPairs.map(addr => ({ target: addr })) }) : [];

      ownerTokens.push(
        ...assetsResultV3.map((assets, i) => [assets.map(a => a.token), indexesV3[i]]),
        ...stakingIdx.map(i => [[pairedLpTokens[i]], stakingTokensV3[i]]),
        ...lendingIdx.map((i, k) => [[vaultTokens[k]], lendingPairs[k]]),
      );
    }
  }

  await sumTokens2({ api, ownerTokens, blacklistedTokens: [...indexesV2,...indexesV3, '0xc31389794ffac23331e0d9f611b7953f90aa5fdc'], resolveLP: true });
  [...indexesV2, ...indexesV3].forEach(t => api.removeTokenBalance(t));
  Object.keys(api.getBalances())
    .filter(token => new RegExp(peasToken, 'i').test(token) !== isStaking)
    .forEach(t => api.removeTokenBalance(t));
};


const borrowed = async (api) => {
  if (config[api.chain].indexManagerV3) {
    const lendingPairs = await discoverLendingPairs(api);
    if (!lendingPairs || !lendingPairs.length) return;

    const [lendingPairAssets, previews] = await Promise.all([
      api.multiCall({ abi: abi.asset,   calls: lendingPairs }),
      api.multiCall({ abi: abi.previewAddInterest, calls: lendingPairs }),
    ]);

    lendingPairAssets.map((asset, i) => [asset, previews[i].totalBorrow.amount]).forEach(([token, amount]) => api.add(token, amount));
  }
}

module.exports = {
  methodology: "Aggregates TVL in all Peapods Finance indexes created",
  hallmarks: [[1710444951, "Arbitrum launch"],[1715151225, "Base launch"],[1715214483, "Mode launch"],[1738958400, "LVF launch"],[1742269792, "Sonic launch"],[1744292339, "Berachain launch"]],
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => getTvl(api, false),
    staking: async (api) => getTvl(api, true),
    borrowed: async (api) => borrowed(api),
  }
})
