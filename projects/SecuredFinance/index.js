const config = {
  ethereum: { FIL: '0x6a7b717ae5ed65f85ba25403d5063d368239828e'},
  arbitrum: {},
  avax: { FIL: '0xf3bcb00146d1123dd19974de758f83d01e26d3f1'},
  polygon_zkevm: { vault: '0x0896AC8B9e2DC3545392ff65061E5a8a3eD68824' },
}

Object.keys(config).forEach(chain => {
  const { vault = '0xB74749b2213916b1dA3b869E41c7c57f1db69393', FIL } = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const bytes = await api.call({ abi: 'function getCollateralCurrencies() view returns (bytes32[])', target: vault })
      const tokens = await api.multiCall({ abi: 'function getTokenAddress(bytes32) view returns (address)', calls: bytes, target: vault })
      if (FIL) tokens.push(FIL)
      return api.sumTokens({ owner: vault, tokens, })
    }
  }
})
