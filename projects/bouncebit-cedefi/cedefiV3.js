const ADDRESSES = require('../helper/coreAssets.json')
const { cachedGraphQuery } = require("../helper/cache")

const config = {
  ethereum: [{
    type: 'subscribe',
    url: 'https://api.studio.thegraph.com/query/109925/portal-eth-v-3/v0.0.1',
    query: `query {
      tokens(first:10) {
        id
        tvl
      }
      _meta {
        block {
          number
        }
      }
    }`
  }, {
    type: 'simpleETHReward',
    url: 'https://bitswap-subgraph.bouncebit.io/subgraphs/name/portal-bb-v-3',
    query: `query {
      _meta {
        block {
          number
        }
      }
      tokenRewards(where: {tokenMappings_: {eid: "30101", oAddress: ${ADDRESSES.GAS_TOKEN_2}}}) {
        reward
      }
    }`
  }],
  bsc: [{
      type: 'subscribe',
      url: 'https://api.studio.thegraph.com/query/109925/portal-bsc-v-3/v0.0.1',
      query: `query {
        tokens(first:10) {
          id
          tvl
        }
        _meta {
          block {
            number
          }
        }
      }`
    },
    {
      type: 'rewardList',
      url: 'https://bitswap-subgraph.bouncebit.io/subgraphs/name/portal-bb-v-3',
      query: `query {
        tokenRewards(first: 10) {
          reward
          tokenMappings{
            eid
            oAddress
          }
        }
        _meta {
          block {
            number
          }
        }
      }`
    }
  ]
}

async function fetchTokens(chain, subgraphUrl, query, cacheKey = '') {
  const prefix = `bouncebit-cedefi-v3${cacheKey}`
  return cachedGraphQuery(`${prefix}/${chain}`, subgraphUrl, query)
  // return graphQuery(subgraphUrl, query)
}

async function cedefiV3Tvl(api) {
  const chain = api.chain
  const graphConfigList = config[chain]
  if (graphConfigList.length === 0) return api

  const sourceTokenLists = await Promise.all(
    graphConfigList.map(item => fetchTokens(chain, item.url, item.query, item.type))
  )
  const subscribeTokenLists = sourceTokenLists.filter((_, idx) => graphConfigList[idx].type === 'subscribe').flatMap(result => result.tokens)

  const rewardTokenLists = sourceTokenLists.filter((_, idx) => graphConfigList[idx].type === 'rewardList').flatMap(result => {
    return result.tokenRewards.flatMap(item => {
      // only bsc
      const targetToken = item.tokenMappings.find(i => i.eid == '30102')
      if (item.reward > 0 && targetToken && targetToken.oAddress) {
        return [{
          id: targetToken.oAddress,
          tvl: item.reward
        }]
      }
    }).filter(i => !!i)
  })
  
  const rewardByETH = sourceTokenLists.filter((_, idx) => graphConfigList[idx].type === 'simpleETHReward').flatMap(result => {
    return result.tokenRewards.flatMap(item => {
      if (item.reward > 0) {
        return [{
          id: ADDRESSES.null,
          tvl: item.reward
        }]
      }
    }).filter(i => !!i)
  })

  const allTokens = [...subscribeTokenLists, ...rewardTokenLists, ...rewardByETH]

  allTokens.forEach(token => {
    api.add(token.id, token.tvl)
  })

  return api
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: cedefiV3Tvl
  }
})