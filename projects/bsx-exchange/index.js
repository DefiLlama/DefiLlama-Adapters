const { sumTokens2 } = require("../helper/unwrapLPs")
const { nullAddress } = require("../helper/tokenMapping")
const { sumTokensExport } = require("../helper/unwrapLPs")

const config = {
  base: {
    'exchange': '0x26a54955a5fb9472d3edfeac9b8e4c0ab5779ed3',
    'degen': '0x797d6f745F691133cE90438e1Ba3eeEb16e4b5B5',
    'staking': '0xE5E10Bf64CD32218CdbF501914B7A0d181934930',
    'stakingToken': '0xd47f3e45b23b7594f5d5e1ccfde63237c60be49e',
  }
}

Object.keys(config).forEach(chain => {
  const { exchange, degen, staking, stakingToken, } = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const tokens = await api.call({ abi: 'address[]:getSupportedTokenList', target: exchange })
      tokens.push(nullAddress)

      const owners = [exchange, degen,]
      return sumTokens2({ api, owners, tokens, })
    },
  }
  if (stakingToken)
    module.exports[chain].staking = sumTokensExport({ owner: staking, token: stakingToken, })
})
