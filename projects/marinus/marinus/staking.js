/**
 * Validator / stablecoin staking pool TVL — mirrors src/components/harmony/HarmonyMarkets.tsx
 * (totalDelegated + WONE balance + native ONE balance per pool).
 */

const { hasEmptyBytecode } = require('./poolBytecode');

const stakingAbi = {
  totalDelegated: 'uint256:totalDelegated',
};

const erc20BalanceOf = 'function balanceOf(address) view returns (uint256)';

async function readNativePoolBalance(api, poolAddress) {
  if (typeof api.getEthBalance === 'function') {
    return BigInt(await api.getEthBalance(poolAddress));
  }
  if (typeof api.getBalance === 'function') {
    return BigInt(await api.getBalance(poolAddress));
  }
  throw new Error('ChainApi missing getEthBalance/getBalance for native pool balance');
}

async function readStakingPoolBreakdown(api, poolAddress, woneAddress) {
  const [delegated, woneBal, nativeBal] = await Promise.all([
    api.call({ target: poolAddress, abi: stakingAbi.totalDelegated }),
    api.call({ target: woneAddress, abi: erc20BalanceOf, params: [poolAddress] }),
    readNativePoolBalance(api, poolAddress),
  ]);
  return {
    delegated: BigInt(delegated),
    woneBal: BigInt(woneBal),
    nativeBal: BigInt(nativeBal),
    totalOneWei: BigInt(delegated) + BigInt(woneBal) + BigInt(nativeBal),
  };
}

async function addNativeOneTvl(api, amount) {
  if (amount <= 0n) return;
  if (typeof api.addGasToken === 'function') {
    api.addGasToken(amount);
    return;
  }
  // Local verify shim without ChainApi.addGasToken
  api.add('0x0000000000000000000000000000000000000000', amount);
}

/**
 * @param {object} api — DefiLlama ChainApi (or compatible shim)
 * @param {object} config — addresses.json contents
 * @param {object[]} pools — stakingPools entries from addresses.json
 */
async function addStakingPoolTvl(api, config, pools) {
  const wone = config.wone;

  for (const entry of pools) {
    try {
      const { delegated, woneBal, nativeBal } = await readStakingPoolBreakdown(api, entry.pool, wone);
      addNativeOneTvl(api, delegated);
      addNativeOneTvl(api, nativeBal);
      if (woneBal > 0n) api.add(wone, woneBal);
    } catch (err) {
      if (await hasEmptyBytecode(api, entry.pool)) continue;
      throw err;
    }
  }
}

function allStakingPools(config) {
  return config.stakingPools ?? [];
}

module.exports = {
  addNativeOneTvl,
  readStakingPoolBreakdown,
  addStakingPoolTvl,
  allStakingPools,
};
