const { cachedGraphQuery } = require("../helper/cache");
const { nullAddress } = require("../helper/unwrapLPs");

// Textile is a non-custodial on-chain FX DEX. Market makers ("Stitch" bots) quote
// both sides of each corridor from their own wallets, and swaps settle atomically
// through a stateless reactor, so nothing is custodied in protocol contracts. TVL is
// the inventory those makers hold in the corridor tokens on each chain. The maker set
// and the corridor tokens are read from the Textile subgraph, then balances are summed
// on-chain per chain (so it self-updates as makers and corridors change).
const ENDPOINT = "https://api.textilecredit.com/graphql";

const CHAINS = {
  ethereum: 1,
  bsc: 56,
  polygon: 137,
  base: 8453,
  celo: 42220,
};

// Some makers are Textile OperatorVaults. A vault can park idle settlement asset in
// Aave v3 through its own yield adapter (vault.yieldAdapter(), zero when off), which
// holds the aTokens (adapter.yieldToken()). On an emergency pull the adapter sends
// aTokens back to the vault, so the aToken is counted on both.
async function getYieldPositions(api, owners) {
  const adapters = await api.multiCall({ abi: "address:yieldAdapter", calls: owners, permitFailure: true });
  const vaults = owners
    .map((vault, i) => ({ vault, adapter: adapters[i] }))
    .filter(({ adapter }) => adapter && adapter !== nullAddress);
  if (!vaults.length) return [];

  // permitFailure: a non-vault maker contract could expose yieldAdapter() too; skip it rather than fail the chain
  const yieldTokens = await api.multiCall({ abi: "address:yieldToken", calls: vaults.map((v) => v.adapter), permitFailure: true });
  return vaults.flatMap(({ vault, adapter }, i) => yieldTokens[i] ? [
    [yieldTokens[i], adapter],
    [yieldTokens[i], vault],
  ] : []);
}

async function tvl(api) {
  const chainId = CHAINS[api.chain];

  // cached: if the API is down we fall back to the last good maker/corridor lists instead of failing
  const { settlementMakerStats } = await cachedGraphQuery(
    "textile/makers",
    ENDPOINT,
    "{ settlementMakerStats { makers { wallet } } }"
  );
  const owners = settlementMakerStats.makers.map((m) => m.wallet);

  // settlementV3Pools was removed from the schema; corridors carry the same asset pair per chain
  const { settlementCorridors } = await cachedGraphQuery(
    "textile/corridors",
    ENDPOINT,
    "{ settlementCorridors { chainId collateralAsset debtAsset } }"
  );
  const pools = settlementCorridors.filter((p) => +p.chainId === chainId);
  const tokens = [
    ...new Set(pools.flatMap((p) => [p.collateralAsset, p.debtAsset])),
  ];

  const tokensAndOwners = await getYieldPositions(api, owners);
  return api.sumTokens({ owners, tokens, tokensAndOwners });
}

module.exports = {
  methodology:
    "Textile is a non-custodial FX DEX; market makers (Stitch bots) quote from their own wallets and swaps settle atomically through a stateless reactor, so no funds sit in protocol contracts. TVL is the corridor-token inventory those makers hold on each chain, read from the Textile subgraph (makers + pools) and summed on-chain. For makers that are Textile OperatorVaults, idle settlement asset the vault has supplied to Aave v3 through its yield adapter is counted too, via the adapter's aToken balance.",
};

Object.keys(CHAINS).forEach((chain) => {
  module.exports[chain] = { tvl };
});
