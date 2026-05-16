const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const WETH = ADDRESSES.optimism.WETH_1;
const USDM = ADDRESSES.megaeth.USDm;
const USDT0 = ADDRESSES.corn.USDT0;
const BTCB = "0xB0F70C0bD6FD87dbEb7C10dC692a2a6106817072";
const wiTRY = "0x15B271D9012b5820FC42b1c495B4C1e206547De5";
const EXCHANGE = "0x5e3Ae52EbA0F9740364Bd5dd39738e1336086A8b";

module.exports = {
  methodology: 'counts the value of all assets on the WorldInc exchange',
  start: 7274995,
  megaeth: {
    tvl: sumTokensExport({
      owner: EXCHANGE,
      tokens: [WETH, USDM, USDT0, BTCB, wiTRY,],
    }),
  }
}; 