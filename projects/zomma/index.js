const { sumTokensExport } = require("../helper/sumTokens");

const ZOMMA_CONTRACT = "0x709051774c60c0527dbaf880f41425eae036efaf";
const USDC_CONTRACT = "0x3355df6D4c9C3035724Fd0e3914dE96A5a83aaf4";

module.exports = {
  era: {
    methodolgy: "TVL is calculated as the sum of USDC deposited by traders and the liquidity in the Pools.",
    tvl: sumTokensExport({
      owner: ZOMMA_CONTRACT,
      tokens: [USDC_CONTRACT],
    }),
  },
};