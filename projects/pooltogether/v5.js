const abi = require('./abi.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

const V5_VAULT_FACTORIES = {
  optimism: ['0xF65FA202907D6046D1eF33C521889B54BdE08081', '0x6B17EE3a95BcCd605340454c5919e693Ef8EfF0E', '0xF0F151494658baE060034c8f4f199F74910ea806', '0x0C379e9b71ba7079084aDa0D1c1Aeb85d24dFD39', '0xec9f59bd06465b105e719c0b0483a4ed6a656775'],
  base: ['0xE32F6344875494ca3643198d87524519Dc396DDf', '0xa55a74A457D8a24D68DdA0b5d1E0341746d444Bf'],
  arbitrum: ['0x44Be003E55e7cE8a2e0ECC3266f8a9A9de2c07BC', '0x8020Fb37b21E0eF1707aDa7A914baf44F9045E52'],
  ethereum: ['0x29c102109D6cb2D866CFEc380E0E10E9a287A75f', '0xd499CcF3e93F4cfb335Ac388E3C896D59cdDe7c3'],
  scroll: ['0x3fdd8bFdF2F589c10C58457CDAE989C7943A30A5'],
  xdai: ['0xc3aE3FE36A2645a93b2Fe350D81E80A14831e2A6'],
  wc: ['0x08f8ebC3Afc32371d40EF59A951Cb7b2dA425159']
}

const V5_NON_FACTORY_VAULTS = {
  optimism: ['0xa52e38a9147f5ea9e0c5547376c21c9e3f3e5e1f'],
  base: [],
  arbitrum: [],
  ethereum: [],
  scroll: [],
  xdai: [],
  wc: ['0x8aD5959c9245b64173D4C0C3CD3ff66dAc3caB0E']
}

async function tvl(api) {
  const factories = V5_VAULT_FACTORIES[api.chain]
  if (!factories) return {}
  const vaults = []
  for (const factory of factories) {
    const _vaults = await api.fetchList({ lengthAbi: abi.totalVaults, itemAbi: abi.allVaults, target: factory })
    vaults.push(..._vaults)
  }
  vaults.push(...V5_NON_FACTORY_VAULTS[api.chain])
  const tokens = await api.multiCall({ abi: abi.asset, calls: vaults })
  const bals = await api.multiCall({ abi: abi.totalAssets, calls: vaults })
  api.addTokens(tokens, bals)
  return sumTokens2({ api, resolveLP: true })
}

module.exports = {
  tvl
}
