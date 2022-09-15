const { GraphQLClient, gql } = require("graphql-request");

async function fetch() {
  const graphUrl = 'https://graph-node.functionx.io/subgraphs/name/subgraphFX2'
  const graphQLClient = new GraphQLClient(graphUrl);

  const graphQuery = gql`
    query getTVL{
      fxswapFactories {
        totalLiquidityUSD
      }
    }
  `;

  const data = await graphQLClient.request(graphQuery);

  return data.fxswapFactories[0].totalLiquidityUSD
}

module.exports = {
  methodology: `TVL is obtained by getting totalLiquidityUSD using FX Swap Subgraph "https://graph-node.functionx.io/subgraphs/name/subgraphFX2"`,
  fetch
};