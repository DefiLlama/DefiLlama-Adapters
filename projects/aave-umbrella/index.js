const config = {
  ethereum: { factories: ['0xd400fc38ed4732893174325693a63c30ee3881a8'], }
}

Object.keys(config).forEach(chain => {
  const { factories, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const stkTokens = (await api.multiCall({ calls: factories, abi: 'address[]:getStkTokens' })).flat()
      const tokens = await api.multiCall({ abi: 'address:asset', calls: stkTokens })
      return api.sumTokens({ tokensAndOwners2: [tokens, stkTokens], })
    }
  }
})

module.exports.doublecounted = true