const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const masterchef = "0x705A71efadD12faDac67600b666D8c0347848BD3";
const token_USDC = ADDRESSES.telos.ETH;
const token_USDT = ADDRESSES.moonriver.USDT;

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDC, token_USDT]
    })
  }
}
