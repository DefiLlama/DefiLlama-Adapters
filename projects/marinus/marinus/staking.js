/**
 * Validator / stablecoin staking pool TVL — mirrors src/components/harmony/HarmonyMarkets.tsx
 * (totalDelegated + WONE balance + native ONE balance per pool).
 */

const stakingAbi = {
  totalDelegated: 'uint256:totalDelegated',
};

const erc20BalanceOf = 'function balanceOf(address) view returns (uint256)';

async function readStakingPoolBreakdown(api, poolAddress, woneAddress) {
  const [delegated, woneBal, nativeBal] = await Promise.all([
    api.call({ target: poolAddress, abi: stakingAbi.totalDelegated }),
    api.call({ target: woneAddress, abi: erc20BalanceOf, params: [poolAddress] }),
    api.getBalance(poolAddress),
  ]);
  return {
    delegated: BigInt(delegated),
    woneBal: BigInt(woneBal),
    nativeBal: BigInt(nativeBal),
    totalOneWei: BigInt(delegated) + BigInt(woneBal) + BigInt(nativeBal),
  };
}

/**
 * @param {object} api — DefiLlama ChainApi (or compatible shim)
 * @param {object} config — addresses.json contents
 * @param {object[]} pools — stakingPools entries from addresses.json
 */
async function addStakingPoolTvl(api, config, pools) {
  const wone = config.wone;
  const nativeKey = config.nativePriceKey || 'coingecko:harmony';

  for (const entry of pools) {
    try {
      const { delegated, woneBal, nativeBal } = await readStakingPoolBreakdown(api, entry.pool, wone);
      if (delegated > 0n) api.add(nativeKey, delegated);
      if (nativeBal > 0n) api.add(nativeKey, nativeBal);
      if (woneBal > 0n) api.add(wone, woneBal);
    } catch {
      /* skip retired pools */
    }
  }
}

function allStakingPools(config) {
  return config.stakingPools ?? [];
}

module.exports = {
  readStakingPoolBreakdown,
  addStakingPoolTvl,
  allStakingPools,
};
