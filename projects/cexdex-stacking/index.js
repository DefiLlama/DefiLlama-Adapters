const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const token_USDC = ADDRESSES.telos.ETH;
const token_USDT = ADDRESSES.moonriver.USDT;
const masterchef = "0x451c3a3594aEB75EDcb13F132dc11D7d2972861A";

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDC, token_USDT]
    })
  }
}
