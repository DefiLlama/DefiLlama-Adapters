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

module.exports.ethereum.pool2 = async (ts, block) => {
  return sumTokens({}, [
     ['0x4a86c01d67965f8cb3d0aaa2c655705e64097c31', '0xd10ef2a513cee0db54e959ef16cac711470b62cf', ]
  ], block, undefined, undefined, { resolveLP: true })
}