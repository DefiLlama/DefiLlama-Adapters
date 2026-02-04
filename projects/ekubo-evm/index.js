const { sumTokensExport } = require('../helper/unwrapLPs')

const config = {
  ethereum: { owners: ['0xe0e0e08a6a4b9dc7bd67bcb7aade5cf48157d444'] }
}

Object.keys(config).forEach(chain => {
  config[chain].fetchCoValentTokens = true
  config[chain].tokenConfig = { onlyWhitelisted: false }
  module.exports[chain] = {
    tvl: sumTokensExport(config[chain])
  }
})