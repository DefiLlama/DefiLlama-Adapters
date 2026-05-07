const { sumTokensExport } = require('../helper/unwrapLPs.js')

const config = require('./config.js')

Object.keys(config).forEach(chain => {
  const tokensAndOwners = config[chain]
    .map(({ tokens, holders }) =>
      holders.flatMap(o => tokens.map(t => [t, o]))
    )
    .flat()

  module.exports[chain] = {
    tvl: () => ({}),
    staking: sumTokensExport({ tokensAndOwners }),
  }
})
