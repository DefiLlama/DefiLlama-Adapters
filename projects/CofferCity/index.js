const abi = {
  "getSupportedTokens": "function getSupportedTokens() view returns (address[] supportedTokens)"
}

const config = {
  kava: {
    CofferCityKAVA: '0x860880862Ee1B74D00E2F94B1C81A67C2c58117E'
  }
}

module.exports = {
  methodology: 'Counts TVL of all the assets supported by the Coffer City smart contracts'
};

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (api) => {
      const vaults = Object.values(config[chain])
      const tokens = await api.multiCall({ abi: abi.getSupportedTokens, calls: vaults })
      const ownerTokens = vaults.map((v, i) => [tokens[i], v])
      return api.sumTokens({ ownerTokens })
    }
  }
})
