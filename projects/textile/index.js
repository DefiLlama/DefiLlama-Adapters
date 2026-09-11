const { graphQuery } = require("../helper/http");

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
  base: 8453,
  celo: 42220,
};

async function tvl(api) {
  const chainId = CHAINS[api.chain];

  const { settlementMakerStats } = await graphQuery(
    ENDPOINT,
    "{ settlementMakerStats { makers { wallet } } }"
  );
  const owners = settlementMakerStats.makers.map((m) => m.wallet);

  const { settlementV3Pools } = await graphQuery(
    ENDPOINT,
    `{ settlementV3Pools(chainId: ${chainId}) { collateralAsset debtAsset } }`
  );
  const tokens = [
    ...new Set(settlementV3Pools.flatMap((p) => [p.collateralAsset, p.debtAsset])),
  ];

  return api.sumTokens({ owners, tokens });
}

module.exports = {
  methodology:
    "Textile is a non-custodial FX DEX; market makers (Stitch bots) quote from their own wallets and swaps settle atomically through a stateless reactor, so no funds sit in protocol contracts. TVL is the corridor-token inventory those makers hold on each chain, read from the Textile subgraph (makers + pools) and summed on-chain.",
};

Object.keys(CHAINS).forEach((chain) => {
  module.exports[chain] = { tvl };
});
