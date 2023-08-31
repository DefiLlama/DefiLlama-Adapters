const { sumTokensExport } = require('../helper/unwrapLPs')

const vaultAddress = "0x86C077092018077Df34FF44D5D7d3f9A2DF03bEf"

module.exports = { ethereum: { tvl: sumTokensExport({ owner: vaultAddress, fetchCoValentTokens: true, }), } }
