const config = {
  optimism: '0x86C7b9640302082B0dF78023F930d8612bFcaD3f',
  arbitrum: '0x29fAD9d44C550e5D8081AB35763797B39d75b858',
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