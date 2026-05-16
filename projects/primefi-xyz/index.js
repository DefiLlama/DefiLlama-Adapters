const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology: 'Counts collateral in PRFI/wrapped-native LP tokens.',
  base: {
    tvl: sumTokensExport({ owner: "0x87B417AF600312df37F551a05ae14bCC3d55bC36", tokens: ["0x4200000000000000000000000000000000000006"] }),  // WETH
    staking: sumTokensExport({ owner: "0x87B417AF600312df37F551a05ae14bCC3d55bC36", tokens: ["0x7BBCf1B600565AE023a1806ef637Af4739dE3255"] })  // PRFI
  },
  hyperliquid: {
    tvl: sumTokensExport({ owner: "0x981F145a71Da6DF4A7cBe892807782c9CC9a5515", tokens: ["0x5555555555555555555555555555555555555555"] }),  // WHYPE
    staking: sumTokensExport({ owner: "0x981F145a71Da6DF4A7cBe892807782c9CC9a5515", tokens: ["0x7BBCf1B600565AE023a1806ef637Af4739dE3255"] })  // PRFI
  },
  xdc: {
    tvl: sumTokensExport({ owner: "0xffA04F091128fb89D3B1eCd0149DC677dfAe1C69", tokens: ["0x951857744785E80e2De051c32EE7b25f9c458C42"] }),  // WXDC
    staking: sumTokensExport({ owner: "0xffA04F091128fb89D3B1eCd0149DC677dfAe1C69", tokens: ["0x81B244d0be055EF3BEF1b09B7826Cc2b108B2cBD"] })  // PRFI
  },
};
