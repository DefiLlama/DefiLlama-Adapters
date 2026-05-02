const { request, gql } = require("graphql-request");
const { ethers } = require("ethers");

const SUBGRAPH =
  "https://api.goldsky.com/api/public/project_cmm7vh5xwsa8m01qmdr7w7u62/subgraphs/tsunami-v3/2.4.0/gn";

const WETH = "0x4200000000000000000000000000000000000006";

// Same exclusion list as the Tsunami DEX adapter — covers oracle helper,
// dust pools, and developer test-token pools.
const EXCLUDED_POOLS = new Set([
  "0xd43839e216c40a9825132c8fb47dbcb0b20c3f72",
  "0x075425ba32cd03e9a33bd059d5d2b92429f39552",
  "0xa3d3fc7e5de722ed5e9706380988d5576c33ffd5",
]);
const TEST_SYMBOL = /^test\d*$/i;

function isHidden(pool) {
  if (EXCLUDED_POOLS.has(pool.id.toLowerCase())) return true;
  if (TEST_SYMBOL.test(pool.token0.symbol || "")) return true;
  if (TEST_SYMBOL.test(pool.token1.symbol || "")) return true;
  return false;
}

function poolWethEquivalent(p) {
  const isWeth0 = p.token0.id.toLowerCase() === WETH;
  const isWeth1 = p.token1.id.toLowerCase() === WETH;
  if (!isWeth0 && !isWeth1) return 0;
  const tvl0 = parseFloat(p.totalValueLockedToken0) || 0;
  const tvl1 = parseFloat(p.totalValueLockedToken1) || 0;
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
      query sentryPools($lastId: ID!, $first: Int!) {
        pools(
          first: $first
          where: { isSentry: true, id_gt: $lastId }
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
    "TVL is the sum of value locked in Tsunami V3 pools created by the Sentry Launch Factory (Pool.isSentry == true in the subgraph; covers both V4 factory 0xDc37e11B68052d1539fa23386eE58Ac444bf5BE1 and the legacy agent factory 0x733733E8eAbB94832847AbF0E0EeD6031c3EB2E4). Each pool contributes its WETH balance plus the paired token's value at the pool's own WETH ratio — same per-pool calculation as the Tsunami frontend.",
  ink: { tvl },
};
