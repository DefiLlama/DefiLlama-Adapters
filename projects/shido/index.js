const { request, gql } = require("graphql-request");

const SUBGRAPH_URL = "https://ljd1t705przomdjt11587.cleavr.xyz/subgraphs/name/shido/mainnet";

const tvlQuery = gql`
  {
    pools{
      totalValueLockedUSD
    }
  }
`;

async function fetchTVL() {
  const data = await request(SUBGRAPH_URL, tvlQuery);
  let totalTVL = 0;

  data.pools.forEach((pool) => {
    totalTVL += parseFloat(pool.totalValueLockedUSD);
  });

  return { usd: totalTVL };
}

async function tvl() {
  return fetchTVL();
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology: "Fetches TVL from all liquidity pools listed in the Shido subgraph.",
  start: 0,
  shido: {
    tvl,
  },
};
