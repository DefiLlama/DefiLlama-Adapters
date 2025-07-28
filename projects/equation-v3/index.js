const config = {
  arbitrum: { marketManager: "0xDe2b77bcbAEf4C5ECE3b827B21fbD8556e8Fa5a4", }
}

Object.keys(config).forEach(chain => {
  const { marketManager, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const token = await api.call({ abi: 'address:USD', target: marketManager })
      return api.sumTokens({ owner: marketManager, tokens: [token] })
    }
  }
})