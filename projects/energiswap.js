const { GraphQLClient, gql } = require('graphql-request')

async function fetch() {
    const endpoint = 'https://graphnode.energiswap.info:8000/subgraphs/name/energi/energiswap'
    const graphQLClient = new GraphQLClient(endpoint)

    const query = gql`
      query energiswapFactories {
        energiswapFactories(
        where: { id: "0xa2dAE9e70D5A08B781DeE134617Cf5E7D23043c2" }) { 
          totalLiquidityUSD
        }
      }`;

    const data = await graphQLClient.request(query);

    return data.energiswapFactories[0].totalLiquidityUSD;;
}

module.exports = {
    fetch
}
