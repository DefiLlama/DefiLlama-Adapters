const { sumTokensExport } = require('../helper/unwrapLPs')

const config = require('./config.js')

module.exports = {
};

Object.keys(config).forEach(chain => {
  const tokensAndOwners = config[chain].map(({ tokens, holders }) => holders.map(o => tokens.map(t =>  [t, o])).flat()).flat()
  module.exports[chain] = {
    tvl: sumTokensExport({ tokensAndOwners })
  }
})