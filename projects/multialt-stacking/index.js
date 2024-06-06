const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const masterchef = "0xFFd33A71411fbA8B989Eca9F99EE7a908a2dEf4F";
const token_USDT = ADDRESSES.moonriver.USDT;
const token_USDC = ADDRESSES.telos.ETH;

module.exports = {
  kava: {
    tvl: sumTokensExport({
      owner: masterchef,
      tokens: [token_USDT, token_USDC]
    })
  }
}
