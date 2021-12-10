const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {
    const endpoint = 'https://www.yokaiswap.com/subgraphs/name/yokaiswap/exchange'
    const graphQLClient = new GraphQLClient(endpoint)

    const query = gql`
      query yokaiFactories {
        yokaiFactories { 
          totalLiquidityUSD
        }
      }`;

    const data = await graphQLClient.request(query);

    return data.yokaiFactories[0].totalLiquidityUSD;;
}

module.exports = {
    fetch
}