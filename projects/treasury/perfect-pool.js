const { sumTokensExport } = require("../helper/unwrapLPs")
const ADDRESSES = require('../helper/coreAssets.json')

const TREASURY = '0xFe4559392aF0E6988F2d7A4E6447a2E702Ff215d'

module.exports = {
  start: 1725311445,
  base: {
    tvl: sumTokensExport({ owner: TREASURY, token: ADDRESSES.base.USDC }),
  }
}