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

// cNGN is one asset the issuer deploys across many chains, but DefiLlama only
// prices some of them. CoinGecko's `compliant-naira` has no Celo platform (cNGN
// shipped there in Aug 2026 and the listing hasn't caught up) and points at a Base
// contract that isn't the issuer's. Both addresses below are the official ones from
// https://docs.cngn.co/guides/contract-addresses, so without this the maker
// inventory held in them silently drops out of USD TVL. Balances are still read
// on-chain; this only fixes how they are valued.
const UNPRICED_CNGN = {
  celo: "0xf6829d7393dae24509eb1e52ee8e572e2e271a4f",
  base: "0x46c85152bfe9f96829aa94755d9f915f9b10ef5f",
};
const CNGN_ID = "coingecko:compliant-naira";
const CNGN_DECIMALS = 6;

function priceCngn(api) {
  const token = UNPRICED_CNGN[api.chain];
  if (!token) return;

  const balances = api.getBalances();
  const key = `${api.chain}:${token}`;
  const balance = balances[key];
  if (!balance) return;

  delete balances[key];
  api.add(CNGN_ID, Number(balance) / 10 ** CNGN_DECIMALS, { skipChain: true });
}

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

  await api.sumTokens({ owners, tokens });
  priceCngn(api);

  return api.getBalances();
}

module.exports = {
  methodology:
    "Textile is a non-custodial FX DEX; market makers (Stitch bots) quote from their own wallets and swaps settle atomically through a stateless reactor, so no funds sit in protocol contracts. TVL is the corridor-token inventory those makers hold on each chain, read from the Textile subgraph (makers + pools) and summed on-chain.",
};

Object.keys(CHAINS).forEach((chain) => {
  module.exports[chain] = { tvl };
});
