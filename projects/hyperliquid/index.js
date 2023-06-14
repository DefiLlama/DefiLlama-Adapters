const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  arbitrum: {
    tvl: sumTokensExport({ owner: '0xc67e9efdb8a66a4b91b1f3731c75f500130373a4', tokens: [ADDRESSES.arbitrum.USDC] })
  }
}