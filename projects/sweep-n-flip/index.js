const { GraphQLClient, } = require('graphql-request')
const BigNumber = require("bignumber.js");

const backendEndpoint = 'https://us-east1-nftfy-backend.cloudfunctions.net/v2/graphql'

const graphQLClient = new GraphQLClient(backendEndpoint)

const query = `
  query AmmTopPools($chainId: Int!) {
    topPools(chainId: $chainId) {
      liquidity
      erc20Token {
        id
      }
    }
  }
`

const polygonQuery = graphQLClient.request(query, { chainId: 137})
const ethereumQuery = graphQLClient.request(query, { chainId: 1})
const arbitrumQuery = graphQLClient.request(query, { chainId: 42161})

const obtainPools = async () => {
  const { topPools: polygonTopPools } = await polygonQuery
  const { topPools: ethereumTopPools } = await ethereumQuery
  const { topPools: arbitrumTopPools } = await arbitrumQuery

  return {
    polygon: polygonTopPools,
    ethereum: ethereumTopPools,
    arbitrum: arbitrumTopPools,
  }
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'TVL counts the liquidity of the pools on each chain.',
  arbitrum: {
    tvl: async (_, _1, _2, { api }) => {
      const { topPools } = await ethereumQuery
      topPools.forEach(pool => {
        const liquidityInWei = BigInt(Number(pool.liquidity.replace(',', '')) * 1e18)
        api.add(pool.erc20Token.id, liquidityInWei.toString())
      })
    },
  },
  ethereum: {
    tvl: async (_, _1, _2, { api }) => {
      const { topPools } = await ethereumQuery
      topPools.forEach(pool => {
        const liquidityInWei = BigInt(Number(pool.liquidity.replace(',', '')) * 1e18)
        api.add(pool.erc20Token.id, liquidityInWei.toString())
      })
    },
  },
  polygon: {
    tvl: async (_, _1, _2, { api }) => {
      const { topPools } = await polygonQuery
      topPools.forEach(pool => {
        const liquidityInWei = BigInt(Number(pool.liquidity.replace(',', '')) * 1e18)
        api.add(pool.erc20Token.id, liquidityInWei.toString())
      })
    },
  },
}
