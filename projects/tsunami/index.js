const { request, gql } = require("graphql-request");
const { ethers } = require("ethers");

const SUBGRAPH =
  "https://api.goldsky.com/api/public/project_cmm7vh5xwsa8m01qmdr7w7u62/subgraphs/tsunami-v3/2.4.0/gn";

const WETH = "0x4200000000000000000000000000000000000006";

// Pools known to have skewed single-tick math that inflates subgraph TVL,
// or dust pools that just clutter the listing. Mirrors the frontend's
// EXCLUDED_POOLS in tsunami/frontend/src/config/contracts.ts.
const EXCLUDED_POOLS = new Set([
  "0xd43839e216c40a9825132c8fb47dbcb0b20c3f72", // USDT0/WETH 0.05% oracle helper
  "0x075425ba32cd03e9a33bd059d5d2b92429f39552", // WETH/SENTRY 1% dust
  "0xa3d3fc7e5de722ed5e9706380988d5576c33ffd5", // WETH/MOLTING 1% dust
]);
// Developer test tokens (TEST, TEST1, Test4, etc.) are hidden the same way.
const TEST_SYMBOL = /^test\d*$/i;

function isHidden(pool) {
  if (EXCLUDED_POOLS.has(pool.id.toLowerCase())) return true;
  if (TEST_SYMBOL.test(pool.token0.symbol || "")) return true;
  if (TEST_SYMBOL.test(pool.token1.symbol || "")) return true;
  return false;
}

// TVL is anchored to WETH the way the Tsunami frontend computes it: each
// visible pool contributes its WETH side at face value plus the meme-token
// side priced at the pool's own WETH ratio. Pools without a WETH side are
// skipped — that automatically excludes the USDT0/NAMI peg pool whose
// single-tick math reports inflated TVL to the subgraph.
function poolWethEquivalent(p) {
  const isWeth0 = p.token0.id.toLowerCase() === WETH;
  const isWeth1 = p.token1.id.toLowerCase() === WETH;
  if (!isWeth0 && !isWeth1) return 0;
  const tvl0 = parseFloat(p.totalValueLockedToken0) || 0;
  const tvl1 = parseFloat(p.totalValueLockedToken1) || 0;
  // Tsunami subgraph convention: token0Price = token0 per token1.
  // So when WETH = token0, token0Price is WETH per (token1 unit) — the
  // meme-token side multiplied by token0Price gives WETH-equivalent.
  if (isWeth0) {
    return tvl0 + tvl1 * (parseFloat(p.token0Price) || 0);
  }
  return tvl1 + tvl0 * (parseFloat(p.token1Price) || 0);
}

async function tvl(api) {
  const pageSize = 1000;
  let lastId = "";
  let totalWeth = 0;

  while (true) {
    const query = gql`
      query pools($lastId: ID!, $first: Int!) {
        pools(
          first: $first
          where: { id_gt: $lastId }
          orderBy: id
          orderDirection: asc
        ) {
          id
          token0 { id symbol }
          token1 { id symbol }
          token0Price
          token1Price
          totalValueLockedToken0
          totalValueLockedToken1
        }
      }
    `;
    const { pools } = await request(SUBGRAPH, query, { lastId, first: pageSize });
    if (pools.length === 0) break;
    for (const p of pools) {
      if (isHidden(p)) continue;
      totalWeth += poolWethEquivalent(p);
    }
    if (pools.length < pageSize) break;
    lastId = pools[pools.length - 1].id;
  }

  if (totalWeth > 0) {
    api.add(WETH, ethers.parseUnits(totalWeth.toFixed(18), 18).toString());
  }
}

module.exports = {
  methodology:
    "TVL mirrors the Tsunami frontend: each visible pool contributes its WETH-side balance plus the paired token's value derived from the pool's own WETH ratio (subgraph token0Price/token1Price). Pools without a WETH side are skipped, which automatically excludes single-tick peg pools whose math is mechanically broken (e.g. USDT0/NAMI). Address blacklist and developer test-token pools are also excluded.",
  ink: { tvl },
};
