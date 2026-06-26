const sui = require("../helper/chain/sui");

// SweetHouse vault (shared object) on Sui mainnet. It stores one House<CoinType>
// per supported asset as a dynamic object field (keyed by sweethouse::HouseKey).
const VAULT =
  "0xa1549d73230118716bc08865b8d62454f360ddaf40eee2158e458e52125d4ef1";

async function tvl(api) {
  // Resolve only the per-coin House objects out of the vault's dynamic fields.
  const houses = await sui.getDynamicFieldObjects({
    parent: VAULT,
    idFilter: (i) => i.objectType && i.objectType.includes("::house::House<"),
  });

  for (const house of houses) {
    if (!house || !house.fields) continue;
    // House<COIN_TYPE> — the phantom coin type backs every pool below.
    const match = (house.type || "").match(/::house::House<(.+)>$/);
    if (!match) continue;
    const coinType = match[1];

    const pools = [
      house.fields.private_pool,
      house.fields.public_pool,
      house.fields.rakeback_pool,
      ...(house.fields.whitelist_pools || []),
    ];

    for (const pool of pools) {
      if (!pool || !pool.fields) continue;
      // On-hand liquidity (Balance<T>, serialized as a u64 string) plus liquidity
      // routed into yield venues (pipe_debt is a Supply<PoolDebt<T>>, value nested
      // under .fields.value) — both are bankroll that backs casino payouts.
      const balance = pool.fields.balance;
      const pipeDebt = pool.fields.pipe_debt && pool.fields.pipe_debt.fields
        ? pool.fields.pipe_debt.fields.value
        : undefined;
      if (balance) api.add(coinType, balance);
      if (pipeDebt) api.add(coinType, pipeDebt);
    }
  }
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL is the SweetHouse bankroll on Sui that backs Suigar's provably-fair casino payouts. For each supported coin (SUI, USDC) it sums, across the private, public, rakeback and whitelist liquidity pools of that coin's House, the on-hand balance plus the liquidity routed into yield venues (pipe debt).",
  sui: { tvl },
};
