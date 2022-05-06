const { sumTokens,  } = require("../helper/unwrapLPs")
const config = require("./config")

Object.keys(config).forEach(chain => {
  const chainExport = {
    tvl: () => ({}),
  }
  module.exports[chain] = chainExport
  Object.keys(config[chain]).forEach(exportKey => {
    let {
      pools = []
    } = config[chain][exportKey]
    chainExport[exportKey] = async (ts, _block, { [chain]: block}) => {
      const balances = {}
      const tokensAndOwners = []
      pools.forEach(({ pool, tokens }) => {
        tokens.forEach(token => tokensAndOwners.push([token, pool]))
      })
      await sumTokens(balances, tokensAndOwners, block, chain)
      return balances
    }
  })
})
