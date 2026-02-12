// Nexion auto-compounding vaults: dynamically discovered from VaultFactory
const VAULT_FACTORY = "0x12e26946c0A2fdd6bdaDBD4F2682d077Acc8Edd6";

/**
 * Calculates TVL for all auto-compounding vaults by dynamically
 * enumerating them from the on-chain VaultFactory, then unwrapping
 * LP positions into underlying token amounts.
 */
async function tvl(api) {
  // Enumerate all vaults from factory
  const vaults = await api.fetchList({
    target: VAULT_FACTORY,
    lengthAbi: 'uint256:allVaultsLength',
    itemAbi: 'function allVaults(uint256) view returns (address)',
  });

  if (!vaults.length) return;

  // Get the want (LP) token and balance for each vault
  // permitFailure handles vaults that may be uninitialized or use a different interface
  const [wantTokens, balances] = await Promise.all([
    api.multiCall({ abi: 'address:want', calls: vaults, permitFailure: true }),
    api.multiCall({ abi: 'uint256:balance', calls: vaults, permitFailure: true }),
  ]);

  // Aggregate balances per unique LP token, skipping failed/empty vaults
  const lpBalances = {};
  balances.forEach((bal, i) => {
    if (!bal || !wantTokens[i]) return;
    const lp = wantTokens[i];
    lpBalances[lp] = (BigInt(lpBalances[lp] || 0) + BigInt(bal)).toString();
  });

  const uniqueLPs = Object.keys(lpBalances);

  // Get token0, token1, reserves, totalSupply for each LP to manually unwrap
  const [token0s, token1s, reserves, supplies] = await Promise.all([
    api.multiCall({ abi: "address:token0", calls: uniqueLPs }),
    api.multiCall({ abi: "address:token1", calls: uniqueLPs }),
    api.multiCall({
      abi: "function getReserves() view returns (uint112, uint112, uint32)",
      calls: uniqueLPs,
    }),
    api.multiCall({ abi: "uint256:totalSupply", calls: uniqueLPs }),
  ]);

  // Calculate proportional token amounts for each LP position
  uniqueLPs.forEach((lp, i) => {
    const balance = BigInt(lpBalances[lp]);
    const supply = BigInt(supplies[i]);
    if (supply === 0n) return;

    const reserve0 = BigInt(reserves[i][0]);
    const reserve1 = BigInt(reserves[i][1]);

    const amount0 = (balance * reserve0) / supply;
    const amount1 = (balance * reserve1) / supply;

    api.add(token0s[i], amount0.toString());
    api.add(token1s[i], amount1.toString());
  });
}

module.exports = {
  doublecounted: true,
  misrepresentedTokens: true,
  methodology:
    "TVL is the total value of LP tokens deposited across all Nexion auto-compounding vaults, discovered dynamically from the on-chain VaultFactory. Vaults deposit into external MasterChef contracts and auto-compound harvested rewards.",
  pulse: {
    tvl,
  },
};
