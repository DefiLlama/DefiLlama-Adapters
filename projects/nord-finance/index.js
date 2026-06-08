const { sumTokensExport } = require('../helper/unwrapLPs')
const config = require('./config')

module.exports = {}

Object.keys(config).forEach(chain => {
  const { toa = [], staking = [], pool2 = [] } = config[chain]
  const exportObj = {}

  if (toa.length)
    exportObj.tvl = sumTokensExport({ tokensAndOwners: toa, })

  if (staking.length)
    exportObj.staking = sumTokensExport({ tokensAndOwners: staking, })

  if (pool2.length)
    exportObj.pool2 = sumTokensExport({ tokensAndOwners: pool2, })

  module.exports[chain] = exportObj

})