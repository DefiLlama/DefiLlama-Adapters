const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/unwrapLPs')

const contract = "0x57A0B07dcD834cAbB844BEc8E7903A3B2faE6245"
const usdcToken = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"

module.exports = {
    ethereum: { tvl: sumTokensExport({ owner: contract, tokens: [usdcToken]}) },
}