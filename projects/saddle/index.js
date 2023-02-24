
const { sumTokens2 } = require('../helper/unwrapLPs')
const config = require("./config");
const sdk = require('@defillama/sdk')

module.exports = {
  misrepresentedTokens: true,
  methodology:
    "Counts as TVL all the Assets deposited on each chain through different Pool Contracts",

  hallmarks: [
    [1651276800, "sUSDv2 hack"]
  ]
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: async (_, _b, { [chain]: block}) => {
      const toa = []
      const blacklistedTokens = []
      Object.values(config[chain]).forEach(({ address, lpToken, poolTokens }) => {
        blacklistedTokens.push(lpToken)
        poolTokens.forEach(i => toa.push([i.address, address]))
      })
      const balances = await sumTokens2({ tokensAndOwners: toa, chain, block, blacklistedTokens, })
      return balances
    }
  }
})

