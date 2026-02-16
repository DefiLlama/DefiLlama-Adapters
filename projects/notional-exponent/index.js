const { cachedGraphQuery } = require('../helper/cache')

const CONFIG = {
  ethereum: { endpoint: '9fw42E6QrezaPxixKN9H79nWmpVWURkLmcJdgGHyC14B'},
}

const payload = `{
  vaults (first: 1000) {
    id
    asset {
      id
    }
  }
}`

async function tvl(api) {
  const { endpoint } = CONFIG[api.chain]
  const result = await cachedGraphQuery(`notional-exponent/${api.chain}`, endpoint, payload)
  const calls = result.vaults.map(i => i.id)
  return api.erc4626Sum2({ calls })
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})