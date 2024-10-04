const { sumTokens2 } = require("../helper/unwrapLPs")

const config = {
  ethereum: [
    '0x7a486f809c952a6f8dec8cb0ff68173f2b8ed56c', // USDX
  ],
  flare: [
    '0x4a771cc1a39fdd8aa08b8ea51f7fd412e73b3d2b', // USDX
  ]
}

Object.keys(config).forEach(chain => {
  const tokens = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      const supply = await api.multiCall({  abi: 'erc20:totalSupply', calls: tokens})
      api.add(tokens, supply)
      return sumTokens2({ api })
    }
  }
})