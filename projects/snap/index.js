const { uniV3Export } = require("../helper/uniswapV3");
const { uniTvlExport } = require("../helper/unknownTokens");
const { mergeExports } = require("../helper/utils");


const v3 = uniV3Export({
  tac: {
    factory: "0x10253594A832f967994b44f33411940533302ACb",
    fromBlock: 3820258,
    isAlgebra: true,
  },
});

const v2 = uniTvlExport("tac", "0x2e9eB1Dd1F0462336a71dF52A6E387D207b6190f", {
  fromBlock: 4265069,
});

module.exports = mergeExports([
  {
    methodology:
      "Counts token balances locked in Snap pools/pairs on TAC (Algebra V3-style + V2-style AMM).",
  },
  v3,
  v2,
]);

