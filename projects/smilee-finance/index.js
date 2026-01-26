module.exports = {
  methodology: 'Sum of balances from vault contracts associated with each DVP retrieved by the registry.',
}

const config = {
  arbitrum: { provider: '0x110A3B051397956D69733B6fe947648bB9062cf1' }
}

Object.keys(config).forEach(chain => {
  const { provider } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const registry = await api.call({ abi: 'address:registry', target: provider })
      const dvps = await api.call({ abi: 'address[]:getDVPs', target: registry })
      const vaults = await api.multiCall({ abi: 'address:vault', calls: dvps })
      const sideTokens = await api.multiCall({ abi: 'address:sideToken', calls: dvps })
      const baseTokens = await api.multiCall({ abi: 'address:baseToken', calls: dvps })
      return api.sumTokens({ tokensAndOwners2: [sideTokens.concat(baseTokens), vaults.concat(vaults)] })
    }
  }
})
