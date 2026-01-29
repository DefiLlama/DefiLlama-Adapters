const { sumTokens2 } = require("../helper/unwrapLPs");
const { cachedGraphQuery } = require("../helper/cache");

const SUBGRAPH_URL = "https://api.goldsky.com/api/public/project_cmamb6kkls0v2010932jjhxj4/subgraphs/analytics-mainnet/v1.0.3/gn";

async function tvl(api) {
  // Fetch all pools from subgraph
  const query = `{
    pools(first: 1000, where: { totalValueLockedUSD_gt: "0" }) {
      id
      token0 { id }
      token1 { id }
    }
  }`;
  
  const { pools } = await cachedGraphQuery("satsuma-citrea-pools", SUBGRAPH_URL, query);
  
  // Sum token balances in each pool
  const ownerTokens = pools.map(pool => [
    [pool.token0.id, pool.token1.id],
    pool.id
  ]);
  
  return sumTokens2({ api, ownerTokens });
}

module.exports = {
  methodology: "TVL is calculated by summing the value of all tokens locked in Satsuma DEX liquidity pools on Citrea.",
  start: 2236500,
  citrea: {
    tvl,
  },
};
