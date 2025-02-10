const { GraphQLClient, gql } = require('graphql-request')

const graphQLClient = new GraphQLClient('https://api.mondrianswap.xyz/graphql')

const query = gql`
  query tokens {
    embrGetProtocolData {
      totalLiquidity
    }
  }
`

async function tvl() {
  const data = await graphQLClient.request(query)
  return {
    tether: data.embrGetProtocolData.totalLiquidity
  }
}

module.exports = {
  abstract: {
    tvl,
  }
}