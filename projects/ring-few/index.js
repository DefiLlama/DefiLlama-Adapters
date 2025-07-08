
const config = {
  ethereum: { factory: '0x7D86394139bf1122E82FDF45Bb4e3b038A4464DD' },
  blast: { factory: '0x455b20131D59f01d082df1225154fDA813E8CeE9' },
  base: { factory: '0xb3Ad7754f363af676dC1C5be40423FE538a47920' },
  arbitrum: { factory: '0x974Cc3F3468cd9C12731108148C4DABFB5eE556F' },
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
