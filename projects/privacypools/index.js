const { sumTokensExport, nullAddress } = require('../helper/unwrapLPs')

const config = {
  ethereum: { owners: ['0xf241d57c6debae225c0f2e6ea1529373c9a9c9fb'], tokens: [nullAddress] },
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain],)
  }
})