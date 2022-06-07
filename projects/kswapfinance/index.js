const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl.js");

const factory = "0x60DCD4a2406Be12dbe3Bb2AaDa12cFb762A418c1";
const wokt = "0x8F8526dbfd6E38E3D8307702cA8469Bae6C56C15";
const whitelist = [
  "0x382bB369d343125BfB2117af9c149795C6C65C50", // USDT
  "0x54e4622DC504176b3BB432dCCAf504569699a7fF", // BTCK
  "0xEF71CA2EE68F45B9Ad6F72fbdb33d707b872315C", // ETHK
  "0xdF54B6c6195EA4d948D03bfD818D365cf175cFC2", // OKB
  "0xab0d1578216A545532882e420A8C61Ea07B00B12", // KST
];

module.exports = {
  tvl: calculateUsdUniTvl(factory, "okexchain", wokt, whitelist, "okexchain"),
  methodology:
    "We count tvl on LiquidityPool(pairs) through factory contract",
};
