const { graphQuery } = require('../helper/http')
const ADDRESSES = require('../helper/coreAssets.json')

const config = {
  blast: 'https://graphql.predict.fun/graphql'
}


const  query = (after) => `query {
  categories (pagination: {
    first: 100
    ${after ? `after: "${after}"` : ''}
  }) {
    totalCount
    pageInfo {
      hasNextPage
      startCursor
      endCursor
    }
    edges {
      node {
        id
        slug
        title
        statistics {
          liquidityValueUsd
          volume24hUsd
          volumeTotalUsd
        }
      }
    }
  }
}
`

Object.keys(config).forEach(chain => {
  const endpoint = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const categories = []
      let after = null
      do {
        const data = await graphQuery(endpoint, query(after))
        categories.push(...data.categories.edges)
        if (data.categories.pageInfo.hasNextPage) {
          after = data.pageInfo.endCursor
        }
      } while (after)
      const usd =  categories.reduce((tvl, category) => tvl + category.node.statistics.liquidityValueUsd, 0)
      api.add(ADDRESSES.blast.USDB, usd * 1e18)
    }
  }
})

module.exports.timetravel = false