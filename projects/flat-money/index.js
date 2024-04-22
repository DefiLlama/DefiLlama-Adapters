const config = {
  base: '0x95Fa1ddc9a78273f795e67AbE8f1Cd2Cd39831fF'
}

Object.keys(config).forEach(chain => {
  const vault = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const collateral = await api.call({ abi: 'address:collateral', target: vault })
      return api.sumTokens({ tokensAndOwners: [[collateral, vault]] })
    }
  }
})