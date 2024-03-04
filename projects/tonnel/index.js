const { sumTokensExport } = require('../helper/chain/ton')

const config = require('./config.js')


module.exports = {
};

Object.keys(config).forEach(chain => {
  const tokensAndOwners = config[chain].map(({ tokens, holders }) => holders.map(o => tokens.map(t =>  [t, o])).flat()).flat()
  module.exports[chain] = {
    tvl: sumTokensExport({ tokens: tokensAndOwners.map(([t]) => t), owners: tokensAndOwners.map(([, o]) => o) })
  }
})