const sdk = require("@defillama/sdk");
const { cachedGraphQuery } = require('../helper/cache')
const { compoundExports2 } = require('../helper/compound')
const config = {
  sonic: {
    endpoint: sdk.graph.modifyEndpoint('Ha7WNTEk2U1MvMUVMmmv8e7uZxJUYY4n8r57iJHYyYcJ'),
  },  
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed, }
})

async function getPools(api) {
  const { endpoint } = config[api.chain]
  const { pools } = await cachedGraphQuery('enclabs/'+api.chain, endpoint, `{ pools { id  }}`)
  return pools.map(i => i.id)
}

async function tvl(...args) {
  const [api] = args
  const pools = await getPools(api)
  const tvls = pools.map(i => compoundExports2({ comptroller: i}))
  return sdk.util.sumChainTvls(tvls.map(i => i.tvl))(...args)
}

async function borrowed(...args) {
  const [api] = args
  const pools = await getPools(api)
  const tvls = pools.map(i => compoundExports2({ comptroller: i}))
  return sdk.util.sumChainTvls(tvls.map(i => i.borrowed))(...args)
}
