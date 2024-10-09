const { cachedGraphQuery } = require("../helper/cache")

const orderbooks = {
  arbitrum: {
    address: "0x550878091b2b1506069f61ae59e3a5484bca9166",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-arbitrum/0.1/gn",
  },
  base: {
    address: "0xd2938e7c9fe3597f78832ce780feb61945c377d7",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-base/0.7/gn",
  },
  bsc: {
    address: "0xd2938e7c9fe3597f78832ce780feb61945c377d7",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-bsc/0.1/gn",
  },
  flare: {
    address: "0xcee8cd002f151a536394e564b84076c41bbbcd4d",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-flare/0.2/gn",
  },
  linea: {
    address: "0x22410e2a46261a1b1e3899a072f303022801c764",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-linea/0.1/gn",
  },
  polygon: {
    address: "0x7d2f700b1f6fd75734824ea4578960747bdf269a",
    sg: "https://api.goldsky.com/api/public/project_clv14x04y9kzi01saerx7bxpg/subgraphs/ob4-polygon/0.4/gn",
  },
}

const query = `query MyQuery($lastId: ID) {
  erc20S(where: {id_gt: $lastId} first: 1000) { id  }
}`

async function tvl(api) {
  const { address, sg } = orderbooks[api.chain]

  const cacheKey = `raindex/${api.chain}`
  const res = await cachedGraphQuery(cacheKey, sg, query, { fetchById: true, })

  const tokens = res.map(t => t.id)
  return api.sumTokens({ tokens, owner: address })
}

module.exports = {
  methodology: 'Balance of tokens held by Rain Orderbook contract.',
}

Object.keys(orderbooks).forEach(chain => {
  module.exports[chain] = { tvl }
})
