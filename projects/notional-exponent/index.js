const { cachedGraphQuery } = require('../helper/cache')

const CONFIG = {
  ethereum: { endpoint: '9fw42E6QrezaPxixKN9H79nWmpVWURkLmcJdgGHyC14B'},
}

const payload = `{
  vaults {
    id
    asset {
      id
    }
  }
}`

async function tvl(api) {
  const { endpoint } = CONFIG[api.chain]
  const result = await cachedGraphQuery(`notional-exponent/${api.chain}`, endpoint, payload)
  const vaults = result.vaults.map(i => i.id)
  const assets = result.vaults.map(i => i.asset.id)
  const abi = "function totalAssets() view returns (uint256)"
  const data = await api.multiCall({ abi, calls: vaults, permitFailure: true })
  assets.forEach((a, i) => api.add(a, data[i]))
}

Object.keys(CONFIG).forEach((chain) => {
  module.exports[chain] = { tvl }
})