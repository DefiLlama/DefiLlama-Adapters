const { GraphQLClient, gql } = require("graphql-request");

async function fetch() {
  const endpoint =
    "http://laserswap.finance:8000/subgraphs/name/laserswap/exchange";
  const graphQLClient = new GraphQLClient(endpoint);

  const query = gql`
    query pancakeFactories {
      pancakeFactories {
        totalLiquidityUSD
      }
    }
  `;

  const data = await graphQLClient.request(query);

  return data.pancakeFactories[0].totalLiquidityUSD;
}

module.exports = {
  methodology: `Finds TotalLiquidityUSD using the LaserSwap subgraph "http://laserswap.finance:8000/subgraphs/name/laserswap/exchange".`,
  fetch,
};
