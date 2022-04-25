const { GraphQLClient, gql } = require('graphql-request');

async function fetch() {
    var graphQLClient = new GraphQLClient(`https://info.hydradex.org/graphql`);
    const results = await graphQLClient.request(gql
        `query Query {
            hydraswapFactories(
                where: {
                    id: "5a2a927bea6c5f4a48d4e0116049c1e36d52a528"
                }) {
                    totalLiquidityUSD
                }
            }`
        );
    return results.hydraswapFactories[0].totalLiquidityUSD;
};

module.exports = {
  misrepresentedTokens: true,
  timetravel: false,
  methodology: "We count liquidity on the dex, pulling data from subgraph",
  hydra: {
    fetch
  },
  fetch
};