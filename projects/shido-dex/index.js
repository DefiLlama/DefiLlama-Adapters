const { post } = require('../helper/http');

const SUBGRAPH_URL = "https://prod-v2-graph-node.shidoscan.com/subgraphs/name/shido/mainnet";

async function tvl(api) {
  const query = `
    {
      pools(first: 1000, orderBy: totalValueLockedUSD, orderDirection: desc) {
        id
        token0 { id }
        token1 { id }
      }
    }
  `;
  
  const response = await post(SUBGRAPH_URL, { query });
  const pools = response?.data?.pools ?? [];

  const tokensAndOwners = [];
  pools.forEach(pool => {
    if (pool.token0?.id) tokensAndOwners.push([pool.token0.id, pool.id]);
    if (pool.token1?.id) tokensAndOwners.push([pool.token1.id, pool.id]);
  });

  return api.sumTokens({ tokensAndOwners });
}

module.exports = {
  misrepresentedTokens: true,
  shido: {
    tvl,
  }
};
