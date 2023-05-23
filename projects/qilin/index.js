const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/unwrapLPs')

const contract = "0x57A0B07dcD834cAbB844BEc8E7903A3B2faE6245"
const usdcToken = ADDRESSES.ethereum.USDC

module.exports = {
    ethereum: { tvl: sumTokensExport({ owner: contract, tokens: [usdcToken]}) },
}