const { nullAddress } = require("../helper/tokenMapping")

const config = {
  base: {
    'exchange':'0x26a54955a5fb9472d3edfeac9b8e4c0ab5779ed3',
    'degen':'0x797d6f745F691133cE90438e1Ba3eeEb16e4b5B5',
    'staking':'0xE5E10Bf64CD32218CdbF501914B7A0d181934930',
  }
}

Object.keys(config).forEach(chain => {
  const { exchange, degen, staking } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.call({ abi: 'address[]:getSupportedTokenList', target: exchange })
      tokens.push(nullAddress)

      const owners = [exchange, degen, staking]
      return api.sumTokens({ owners, tokens, blacklistedTokens: ['0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'] })
    }
  }
})
