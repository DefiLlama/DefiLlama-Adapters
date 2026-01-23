const { graphQuery } = require("../helper/http");

const ENVIO_GRAPHQL_URL =
  process.env.KUMBAYA_GRAPHQL_URL ??
  "https://kby-hasura.up.railway.app/v1/graphql";

const poolsQuery = `
  query {
    Pool(where: { chainId: { _eq: 4326 } }) {
      token0_id
      token1_id
      totalValueLockedToken0
      totalValueLockedToken1
    }
  }
`;

const tokensQuery = `
  query {
    Token(where: { chainId: { _eq: 4326 } }) {
      id
      address
      decimals
    }
  }
`;

async function tvl(api) {
  try {
    const [poolsData, tokensData] = await Promise.all([
      graphQuery(ENVIO_GRAPHQL_URL, poolsQuery),
      graphQuery(ENVIO_GRAPHQL_URL, tokensQuery),
    ]);

    const tokenMap = {};
    for (const token of tokensData.Token || []) {
      tokenMap[token.id] = { address: token.address, decimals: token.decimals };
    }

    for (const pool of poolsData.Pool || []) {
      const token0 = tokenMap[pool.token0_id];
      const token1 = tokenMap[pool.token1_id];

      if (token0 && pool.totalValueLockedToken0) {
        const amount0 = parseFloat(pool.totalValueLockedToken0) * 10 ** token0.decimals;
        if (Number.isFinite(amount0) && amount0 > 0) {
          api.add(token0.address, BigInt(Math.floor(amount0)));
        }
      }

      if (token1 && pool.totalValueLockedToken1) {
        const amount1 = parseFloat(pool.totalValueLockedToken1) * 10 ** token1.decimals;
        if (Number.isFinite(amount1) && amount1 > 0) {
          api.add(token1.address, BigInt(Math.floor(amount1)));
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
