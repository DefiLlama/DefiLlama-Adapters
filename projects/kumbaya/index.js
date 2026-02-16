/**
 * Kumbaya DEX - Uniswap V3 fork on MegaETH
 * https://kumbaya.xyz
 *
 * TVL is computed by summing token balances across all V3 pools.
 * Data source: Envio indexer
 */
const { graphQuery } = require("../helper/http");
const { parseUnits } = require("ethers");

const ENVIO_GRAPHQL_URL =
  process.env.KUMBAYA_GRAPHQL_URL ??
  "https://kby-hasura.up.railway.app/v1/graphql";

const PAGE_SIZE = 1000;

/**
 * Fetches all records from a paginated GraphQL query.
 * @param {string} queryFn - Function that returns query string with limit/offset
 * @param {string} dataKey - Key to extract data array from response
 * @returns {Promise<Array>} All fetched records
 * @throws {Error} If GraphQL request fails
 */
async function fetchAllPaginated(queryFn, dataKey) {
  const results = [];
  let offset = 0;

  while (true) {
    const query = queryFn(PAGE_SIZE, offset);
    let data;
    try {
      data = await graphQuery(ENVIO_GRAPHQL_URL, query);
    } catch (e) {
      throw new Error(`GraphQL request failed at offset ${offset}: ${e.message}`);
    }

    const records = data[dataKey] || [];
    results.push(...records);

    if (records.length < PAGE_SIZE) break;
    offset += PAGE_SIZE;
  }

  return results;
}

const poolsQueryFn = (limit, offset) => `
  query {
    Pool(
      where: { chainId: { _eq: 4326 } }
      order_by: { id: asc }
      limit: ${limit}
      offset: ${offset}
    ) {
      token0_id
      token1_id
      totalValueLockedToken0
      totalValueLockedToken1
    }
  }
`;

const tokensQueryFn = (limit, offset) => `
  query {
    Token(
      where: { chainId: { _eq: 4326 } }
      order_by: { id: asc }
      limit: ${limit}
      offset: ${offset}
    ) {
      id
      address
      decimals
    }
  }
`;

/**
 * Calculates TVL by fetching all pools and their token balances.
 * Adds each token's locked amount to the api balance tracker.
 * @param {object} api - DefiLlama SDK api object for adding token balances
 */
async function tvl(api) {
  try {
    const [pools, tokens] = await Promise.all([
      fetchAllPaginated(poolsQueryFn, "Pool"),
      fetchAllPaginated(tokensQueryFn, "Token"),
    ]);

    const tokenMap = {};
    for (const token of tokens) {
      tokenMap[token.id] = { address: token.address, decimals: token.decimals };
    }

    for (const pool of pools) {
      const token0 = tokenMap[pool.token0_id];
      const token1 = tokenMap[pool.token1_id];

      if (token0 && pool.totalValueLockedToken0) {
        try {
          const amount0 = parseUnits(pool.totalValueLockedToken0, token0.decimals);
          if (amount0 > 0n) {
            api.add(token0.address, amount0);
          }
        } catch {
          // Skip invalid amounts
        }
      }

      if (token1 && pool.totalValueLockedToken1) {
        try {
          const amount1 = parseUnits(pool.totalValueLockedToken1, token1.decimals);
          if (amount1 > 0n) {
            api.add(token1.address, amount1);
          }
        } catch {
          // Skip invalid amounts
        }
      }
    }
  } catch (e) {
    throw new Error(`Kumbaya indexer error: ${e.message}`);
  }
}

module.exports = {
  megaeth: { tvl },
};
