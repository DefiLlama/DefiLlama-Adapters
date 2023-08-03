const { cachedGraphQuery } = require('../helper/cache')
const sdk = require('@defillama/sdk')
const { compoundExports2 } = require('../helper/compound')
const config = {
  bsc: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/venusprotocol/venus-isolated-pools',
  }
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed, }
})

async function getPools(api) {
  const { endpoint } = config[api.chain]
  const { pools } = await cachedGraphQuery('venus-v4', endpoint, `{ pools { id  }}`)
  return pools.map(i => i.id)
}

async function tvl(...args) {
  const [_, _b, _cb, { api, }] = args
  const pools = await getPools(api)
  const tvls = pools.map(i => compoundExports2({ comptroller: i, fetchBalances: true, }))
  return sdk.util.sumChainTvls(tvls.map(i => i.tvl))(...args)
}

async function borrowed(...args) {
  const [_, _b, _cb, { api, }] = args
  const pools = await getPools(api)
  const tvls = pools.map(i => compoundExports2({ comptroller: i, fetchBalances: true, }))
  return sdk.util.sumChainTvls(tvls.map(i => i.borrowed))(...args)
}