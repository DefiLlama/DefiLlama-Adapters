const { cachedGraphQuery } = require('../helper/cache')
const sdk = require('@defillama/sdk')
const { compoundExports2 } = require('../helper/compound')
const config = {
  bsc: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/venusprotocol/venus-isolated-pools',
    corePools: ['0xfd36e2c2a6789db23113685031d7f16329158384'],
  },
  ethereum: {
    endpoint: 'https://api.thegraph.com/subgraphs/name/venusprotocol/venus-isolated-pools-ethereum',
    corePools: ['0x67aA3eCc5831a65A5Ba7be76BED3B5dc7DB60796'],
  }
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = { tvl, borrowed, }
})

async function getPools(api) {
  const { endpoint, corePools } = config[api.chain]
  const poolSet = new Set(corePools.map(i=>i.toLowerCase()))
  const { pools } = await cachedGraphQuery('venus-v4/'+api.chain, endpoint, `{ pools { id  }}`)
  return pools.map(i => i.id).filter(i => !poolSet.has(i.toLowerCase()))
}

async function tvl(...args) {
  const [api] = args
  const pools = await getPools(api)
  const tvls = pools.map(i => compoundExports2({ comptroller: i, fetchBalances: true, }))
  return sdk.util.sumChainTvls(tvls.map(i => i.tvl))(...args)
}

async function borrowed(...args) {
  const [api] = args
  const pools = await getPools(api)
  const tvls = pools.map(i => compoundExports2({ comptroller: i, fetchBalances: true, }))
  return sdk.util.sumChainTvls(tvls.map(i => i.borrowed))(...args)
}
