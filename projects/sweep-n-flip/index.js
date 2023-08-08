const { request, GraphQLClient, } = require("graphql-request")

const backendEndpoint = 'https://us-east1-nftfy-backend.cloudfunctions.net/v2/graphql'

const query = `
  query AmmTopPools($chainId: Int!) {
    topPools(chainId: $chainId) {
      liquidity
    }
  }
`

const polygonQuery = request(query, { chainId: 137})
const ethereumQuery = request(query, { chainId: 1})
const arbitrumQuery = request(query, { chainId: 42161})

const obtainLiquidity = async () => {
  const { topPools: polygonTopPools } = await polygonQuery
  const { topPools: ethereumTopPools } = await ethereumQuery
  const { topPools: arbitrumTopPools } = await arbitrumQuery

  return {
    polygon: polygonTopPools.reduce((acc, pool) => acc + Number(pool.liquidity), 0),
    ethereum: ethereumTopPools.reduce((acc, pool) => acc + Number(pool.liquidity), 0),
    arbitrum: arbitrumTopPools.reduce((acc, pool) => acc + Number(pool.liquidity), 0),
  }
}

module.exports = {
  arbitrum: {
    tvl
  }
}
