const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const token_USDC = ADDRESSES.telos.ETH;
const token_USDT = ADDRESSES.moonriver.USDT;
const masterchef = "0x061362b6c0676fA9995A15D7fFcaef0323A9dF2F";

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDC, token_USDT]
    })
  }
}
