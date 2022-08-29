const { calculateUsdUniTvl } = require("../helper/getUsdUniTvl");

module.exports = {
  methodology: `Uses factory(0xe1F0D4a5123Fd0834Be805d84520DFDCd8CF00b7) address and whitelisted tokens address to find and price Liquidity Pool pairs`,
  misrepresentedTokens: true,
  doublecounted: false,
  timetravel: true,
  incentivized: true,
  ultron: {
    tvl: calculateUsdUniTvl(
      "0xe1F0D4a5123Fd0834Be805d84520DFDCd8CF00b7",
      "ultron",
      "0x3a4f06431457de873b588846d139ec0d86275d54", // wulx
      [
        "0x97fdd294024f50c388e39e73f1705a35cfe87656" // USDT
      ],
      "wulx"
    ),
  }
};