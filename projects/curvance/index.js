const CENTRAL_REGISTRY = "0x1310f352f1389969Ece6741671c4B919523912fF";

const ABI = {
  marketManagers: "function marketManagers() view returns (address[])",
  queryTokensListed: "function queryTokensListed() view returns (address[])",
  asset: "function asset() view returns (address)",
  totalAssets: "function totalAssets() view returns (uint256)",
};

const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";

async function tvl(api) {
  // 1. Get all market managers from the central registry
  const marketManagers = await api.call({
    target: CENTRAL_REGISTRY,
    abi: ABI.marketManagers,
  });

  if (!marketManagers || !marketManagers.length) return {};

  // 2. Get all cTokens listed in each market manager
  const tokenLists = await api.multiCall({
    abi: ABI.queryTokensListed,
    calls: marketManagers.map((target) => ({ target })),
    permitFailure: true,
  });

  // Flatten all cTokens into a single array
  const allCTokens = tokenLists.flat().filter(Boolean);

  if (!allCTokens.length) return {};

  // 3. For each cToken, get the underlying asset address
  const underlyings = await api.multiCall({
    abi: ABI.asset,
    calls: allCTokens.map((target) => ({ target })),
    permitFailure: true,
  });

  // 4. For each cToken, get the totalAssets (total underlying held)
  const totalAssets = await api.multiCall({
    abi: ABI.totalAssets,
    calls: allCTokens.map((target) => ({ target })),
    permitFailure: true,
  });

  // 5. Sum up all collateral (skip debt tokens where underlying is zero address)
  for (let i = 0; i < allCTokens.length; i++) {
    const underlying = underlyings[i];
    const amount = totalAssets[i];

    // Skip debt tokens (cAUSD) which have zero address as underlying
    if (!underlying || underlying === ZERO_ADDRESS) continue;
    if (!amount || amount === "0") continue;

    api.add(underlying, amount);
  }

  return api.getBalances();
}

module.exports = {
  methodology:
    "TVL counts all collateral assets supplied inside Curvance markets by summing totalAssets() from each collateral cToken.",
  timetravel: true,
  monad: {
    tvl,
  },
};
