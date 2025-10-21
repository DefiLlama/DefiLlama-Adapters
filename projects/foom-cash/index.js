const { sumTokensExport } = require('../helper/unwrapLPs.js')

const config = require('./config.js')

Object.keys(config).forEach(chain => {
  const tokensAndOwners = config[chain].map(({ tokens, holders }) => holders.map(o => tokens.map(t =>  [t, o])).flat()).flat()
  module.exports[chain] = {
    tvl: sumTokensExport({ tokensAndOwners })
  }
})
