const imp = '0xe5859f4efc09027a9b718781dcb2c6910cac6e91'
const { sumTokensExport } = require('./helper/unwrapLPs')

const tvl = sumTokensExport({ owner: imp, fetchCoValentTokens: true })

module.exports = {
  ethereum: { tvl },
  bsc: { tvl },
}
