const { sumTokensExport } = require('../helper/unwrapLPs')
const ADDRESSES = require('../helper/coreAssets.json')

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: '0x6d303cee7959f814042d31e0624fb88ec6fbcc1d', tokens: [ADDRESSES.ethereum.USDC] })
  }
}