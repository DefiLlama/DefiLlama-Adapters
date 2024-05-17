const abi = require('./abi.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const V5_VAULT_FACTORIES = {
  optimism: ['0xF65FA202907D6046D1eF33C521889B54BdE08081', '0x6B17EE3a95BcCd605340454c5919e693Ef8EfF0E', '0xF0F151494658baE060034c8f4f199F74910ea806', '0x0C379e9b71ba7079084aDa0D1c1Aeb85d24dFD39']
}

async function tvl(api) {
  const factories = V5_VAULT_FACTORIES[api.chain]
  if (!factories) return {}
  const vaults = []
  for (const factory of factories) {
    const _vaults = await api.fetchList({ lengthAbi: abi.totalVaults, itemAbi: abi.allVaults, target: factory })
    vaults.push(..._vaults)
  }
  const tokens = await api.multiCall({ abi: abi.asset, calls: vaults })
  const bals = await api.multiCall({ abi: abi.totalAssets, calls: vaults })
  api.addTokens(tokens, bals)
  return  sumTokens2({ api, resolveLP: true, })
}

module.exports = {
  tvl
}
