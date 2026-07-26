/**
 * MPool supply TVL — mirrors src/hooks/useHarmonyPoolData.ts (protocol totalSupplied).
 */

const INITIAL_EXCHANGE_RATE = BigInt(1e18);

const mpoolAbi = {
  totalSupply: 'uint256:totalSupply',
  balanceOf: 'function balanceOf(address) view returns (uint256)',
  exchangeRateStored: 'uint256:exchangeRateStored',
  totalLiquidity: 'uint256:totalLiquidity',
  totalReserves: 'uint256:totalReserves',
  totalBorrows: 'uint256:totalBorrows',
  liquidationSurplusToSuppliers: 'uint256:liquidationSurplusToSuppliers',
};

function computeExchangeRate(totalLiq, totalReserves, totalSupply, totalBorrows, liquidationSurplus) {
  if (totalSupply === 0n) return INITIAL_EXCHANGE_RATE;
  const baseSupplyValue = totalLiq > totalReserves ? totalLiq - totalReserves : 0n;
  const borrowContribution = totalBorrows > totalLiq ? totalLiq : totalBorrows;
  const totalUnderlying = baseSupplyValue + borrowContribution + liquidationSurplus;
  return (totalUnderlying * BigInt(1e18)) / totalSupply;
}

function computeTotalSupplied({ totalSupply, burnBal, exchangeRate, totalLiquidity }) {
  const activeMTokenSupply = totalSupply >= burnBal ? totalSupply - burnBal : 0n;
  if (activeMTokenSupply === 0n) return totalLiquidity;
  return (activeMTokenSupply * exchangeRate) / BigInt(1e18);
}

async function readMpoolSupply(api, poolAddress, burnAddress) {
  const [
    totalSupply,
    burnBal,
    totalLiquidity,
    totalReserves,
    totalBorrows,
    liquidationSurplus,
  ] = await Promise.all([
    api.call({ target: poolAddress, abi: mpoolAbi.totalSupply }),
    api.call({ target: poolAddress, abi: mpoolAbi.balanceOf, params: [burnAddress] }),
    api.call({ target: poolAddress, abi: mpoolAbi.totalLiquidity }),
    api.call({ target: poolAddress, abi: mpoolAbi.totalReserves }),
    api.call({ target: poolAddress, abi: mpoolAbi.totalBorrows }),
    api.call({ target: poolAddress, abi: mpoolAbi.liquidationSurplusToSuppliers }).catch(() => 0n),
  ]);

  let exchangeRate;
  try {
    exchangeRate = await api.call({ target: poolAddress, abi: mpoolAbi.exchangeRateStored });
  } catch {
    exchangeRate = computeExchangeRate(
      BigInt(totalLiquidity),
      BigInt(totalReserves),
      BigInt(totalSupply),
      BigInt(totalBorrows),
      BigInt(liquidationSurplus ?? 0),
    );
  }

  return computeTotalSupplied({
    totalSupply: BigInt(totalSupply),
    burnBal: BigInt(burnBal),
    exchangeRate: BigInt(exchangeRate),
    totalLiquidity: BigInt(totalLiquidity),
  });
}

async function readMpoolBorrowed(api, poolAddress) {
  const totalBorrows = await api.call({ target: poolAddress, abi: mpoolAbi.totalBorrows });
  return BigInt(totalBorrows);
}

/**
 * @param {object} api — DefiLlama ChainApi (or compatible shim)
 * @param {object} config — addresses.json contents
 * @param {object[]} pools — mPools entries from addresses.json
 */
async function addMpoolSupplyTvl(api, config, pools) {
  const burnAddress = config.burnAddress;
  for (const entry of pools) {
    const token = config.tokens[entry.underlying];
    if (!token) continue;
    try {
      const supplied = await readMpoolSupply(api, entry.pool, burnAddress);
      if (supplied > 0n) {
        api.add(token.address, supplied);
      }
    } catch (err) {
      // Skip retired pools with no bytecode or RPC failures
      if (process.env.DEFILLAMA_DEBUG) {
        console.warn(`[mpool] skip ${entry.symbol} ${entry.pool}:`, err.message ?? err);
      }
    }
  }
}

/**
 * @param {object} api
 * @param {object} config
 * @param {object[]} pools
 */
async function addMpoolBorrowedTvl(api, config, pools) {
  for (const entry of pools) {
    const token = config.tokens[entry.underlying];
    if (!token) continue;
    try {
      const borrowed = await readMpoolBorrowed(api, entry.pool);
      if (borrowed > 0n) {
        api.add(token.address, borrowed);
      }
    } catch {
      /* skip */
    }
  }
}

function allMPools(config) {
  return config.mPools ?? config.activeMPools ?? [];
}

module.exports = {
  mpoolAbi,
  computeExchangeRate,
  computeTotalSupplied,
  readMpoolSupply,
  readMpoolBorrowed,
  addMpoolSupplyTvl,
  addMpoolBorrowedTvl,
  allMPools,
};
