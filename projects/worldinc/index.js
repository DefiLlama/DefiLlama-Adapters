const { sumTokensExport } = require("../helper/unwrapLPs");

const WETH = "0x4200000000000000000000000000000000000006";
const USDM = "0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7";
const USDT0 = "0xB8CE59FC3717ada4C02eaDF9682A9e934F625ebb";
const BTCB = "0xB0F70C0bD6FD87dbEb7C10dC692a2a6106817072";
const EXCHANGE = "0x5e3Ae52EbA0F9740364Bd5dd39738e1336086A8b";

module.exports = {
  methodology: 'counts the value of all assets on the WorldInc exchange',
  start: 7274995,
  megaeth: {
    tvl: sumTokensExport({
      owner: EXCHANGE,
      tokens: [WETH, USDM, USDT0, BTCB],
    }),
  }
}; 