const { sumTokens2 } = require("../helper/unwrapLPs");

const BASE_CHAIN = 'base';
const SUBGRAPH_URL = "https://api.studio.thegraph.com/query/47039/thirdfy-base/version/latest";

async function tvl(api) {
  // Query subgraph to discover all active Algebra CLMM pools
  const query = `
    query {
      pools(
        where: { liquidity_gt: "0" }
        first: 1000
        orderBy: totalValueLockedUSD
        orderDirection: desc
      ) {
        id
        token0 {
          id
          symbol
          decimals
        }
        token1 {
          id
          symbol
          decimals
        }
        liquidity
        totalValueLockedToken0
        totalValueLockedToken1
      }
    }
  `;

  try {
    const response = await fetch(SUBGRAPH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    });

    const data = await response.json();
    const pools = data.data?.pools || [];

    // Extract unique pool addresses and token addresses
    const owners = pools.map(pool => pool.id); // pool addresses are the owners of tokens
    const tokenSet = new Set();
    
    pools.forEach(pool => {
      tokenSet.add(pool.token0.id);
      tokenSet.add(pool.token1.id);
    });
    
    const tokens = Array.from(tokenSet);

    // Use sumTokens2 to get raw token balances from all pools
    // DeFiLlama will handle pricing automatically
    return sumTokens2({ owners, tokens, api });

  } catch (error) {
    console.error('Error fetching pools from subgraph:', error);
    // Return empty TVL on error
    return sumTokens2({ owners: [], tokens: [], api });
  }
}

module.exports = {
  methodology: "TVL: Total value of all coins held in the smart contracts of the protocol",
  start: 1752451200,
  [BASE_CHAIN]: { tvl },
};
