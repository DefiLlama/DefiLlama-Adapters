const { sumTokens } = require('../helper/unwrapLPs')
const config = require('./config')

module.exports = {}

Object.keys(config).forEach(chain => {
  const { toa = [], staking = [], pool2 = [] } = config[chain]
  const exportObj = {}

  if (toa.length)
    exportObj.tvl = async (_, _b, { [chain]: block }) => sumTokens({}, toa, block, chain)

  if (staking.length)
    exportObj.staking = async (_, _b, { [chain]: block }) => sumTokens({}, staking, block, chain)

  if (pool2.length)
    exportObj.pool2 = async (_, _b, { [chain]: block }) => sumTokens({}, pool2, block, chain)

  module.exports[chain] = exportObj

})