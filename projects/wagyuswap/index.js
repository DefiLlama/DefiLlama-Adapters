const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {
    const endpoint = 'https://thegraph.wagyuswap.app/subgraphs/name/wagyu'
    const graphQLClient = new GraphQLClient(endpoint)

    const query = gql`
      query pancakeFactories {
        pancakeFactories { 
          totalLiquidityUSD
        }
      }`;

    const data = await graphQLClient.request(query);

    return data.pancakeFactories[0].totalLiquidityUSD;;
}

module.exports = {
    fetch
}