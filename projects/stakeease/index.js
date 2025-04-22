const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs")

const SX_ETH_VAULT = "0x466B447D68112090ea46a98E15f22da44f87AF7F"

module.exports = {
  ethereum: {
    tvl: sumTokensExport({ owner: SX_ETH_VAULT, tokens: [
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.EETH,
      '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
      '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0',
      '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7',
    ]}),
  }
};
