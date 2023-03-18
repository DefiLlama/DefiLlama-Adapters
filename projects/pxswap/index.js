const sdk = require('@defillama/sdk')
const { sumTokensExport } = require('../helper/unwrapLPs')

const contract = "0x638B06F80FB28F109E65C9d5cC585aDf9A0c3f9f"
const usdcToken = "0xfA9343C3897324496A05fC75abeD6bAC29f8A40f"

module.exports = {
    kava: { tvl: sumTokensExport({ owner: contract, tokens: [usdcToken]}) },
}
