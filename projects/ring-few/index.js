
const config = {
  blast: { factory: '0x455b20131D59f01d082df1225154fDA813E8CeE9' },
}

module.exports = {
  doublecounted: true,
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const fewTokens = await api.fetchList({ lengthAbi: 'allWrappedTokensLength', itemAbi: 'allWrappedTokens', target: config[chain].factory })
      const tokens = await api.multiCall({ abi: 'address:token', calls: fewTokens })
      const symbols = await api.multiCall({  abi: 'string:symbol', calls: tokens, permitFailure: true })
      const blacklistedTokens = tokens.filter((token, i) => symbols[i] && (symbols[i].includes('RING') || symbols[i].includes('RNG') ))
      return api.sumTokens({ tokensAndOwners2: [tokens, fewTokens], blacklistedTokens, })
    }
  }
})