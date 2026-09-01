const ADDRESSES = require('../helper/coreAssets.json')
const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/unwrapLPs')

const contract = "0x638B06F80FB28F109E65C9d5cC585aDf9A0c3f9f"
const usdcToken = "0xfa9343c3897324496a05fc75abed6bac29f8a40f"

module.exports = {
    kava: { tvl: sumTokensExport({ owner: contract, tokens: [usdcToken]}) },
}
