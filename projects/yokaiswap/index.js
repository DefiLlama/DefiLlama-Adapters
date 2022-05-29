const { GraphQLClient, gql } = require("graphql-request");
const { toUSDTBalances } = require("../helper/balances");
const axios = require("axios");

async function fetch() {
  const endpoint =
    "https://www.yokaiswap.com/subgraphs/name/yokaiswap/exchange";
  const graphQLClient = new GraphQLClient(endpoint);

  const query = gql`
    query yokaiFactories {
      yokaiFactories {
        totalLiquidityUSD
      }
    }
  `;

  const data = await graphQLClient.request(query);

  return toUSDTBalances(data.yokaiFactories[0].totalLiquidityUSD);
}

async function staking() {
  const response = await axios.get(
    "https://www.yokaiswap.com/api/pool_total_staked"
  );

  return toUSDTBalances(response.data/1e18);
}

module.exports = {
  timetravel: false,
  methodology: `Finds TotalLiquidityUSD using the YokaiSwap subgraph "https://www.yokaiswap.com/subgraphs/name/yokaiswap/exchange". Staking accounts for the YOK locked in MasterChef (0x62493bFa183bB6CcD4b4e856230CF72f68299469).`,
  godwoken: {
    tvl: fetch,
    staking,
  },
};
