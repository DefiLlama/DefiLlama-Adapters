const { sumTokens2 } = require('../helper/unwrapLPs')

const config = {
  arbitrum: {
    lendingPools: {
      BTC: '0x711b36a726486bd910a819eb7930e60a1afcac7b',
      USDC: '0xb8bc618e49201B68C1D594aA458aeBFF22B03c35',
      WETH: '0x5d99d1d2e9f3a5f3d8f5dd5ce533b3635590c384',
    }
  }
}

Object.keys(config).forEach(chain => {
  const { lendingPools } = config[chain]
  const pools = Object.values(lendingPools)
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const tokens = await api.multiCall({  abi: 'address:TOKEN', calls: pools})
      const gmdTokens = await api.multiCall({  abi: 'address:gmdTOKEN', calls: pools})
      const ownerTokens = pools.map((v, i) => [[tokens[i],gmdTokens[i],], v])
      return sumTokens2({ api, ownerTokens, })
    },
    /* borrowed: async (_, _b, _cb, { api, }) => {
      const tokens = await api.multiCall({  abi: 'address:gmdTOKEN', calls: pools})
      const bals = await api.multiCall({  abi: 'uint256:totalBorrows', calls: pools})
      api.addTokens(tokens, bals)
    }, */
  }
})