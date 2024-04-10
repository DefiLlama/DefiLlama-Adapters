const abi = require('./abi.json')

const V5_VAULT_FACTORIES = {
  optimism: '0xF65FA202907D6046D1eF33C521889B54BdE08081'
}

async function tvl(api) {
  const factory = V5_VAULT_FACTORIES[api.chain]
  if (!factory) return {}
  const vaults = await api.fetchList({ lengthAbi: abi.totalVaults, itemAbi: abi.allVaults, target: factory })
  const tokens = await api.multiCall({ abi: abi.asset, calls: vaults })
  const bals = await api.multiCall({ abi: abi.totalAssets, calls: vaults })
  api.addTokens(tokens, bals)
  return api.getBalances()
}

module.exports = {
  tvl
}
