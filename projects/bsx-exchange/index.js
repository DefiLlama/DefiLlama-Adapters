const { nullAddress } = require("../helper/tokenMapping")

const config = {
  base: '0x26a54955a5fb9472d3edfeac9b8e4c0ab5779ed3',
}

Object.keys(config).forEach(chain => {
  const exchange = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.call({ abi: 'address[]:getSupportedTokenList', target: exchange })
      tokens.push(nullAddress)
      return api.sumTokens({ owner: exchange, tokens, blacklistedTokens: ['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'] })
    }
  }
})
