const { sumTokensExport } = require("../helper/unwrapLPs");

const PMI_VAULT = "0x9DD6641423200b1FBd0BFF45f376BEE66Be1F4E4";

const USDC = "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359";
const UMA = "0x3066818837c5e6eD6601bd5a91B0762877A6B731";
const WMATIC = "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270";
const GNO = "0x5FFD62D3C3eE2E81C00A7b9079FB248e7dF024A8";

module.exports = {
  methodology:
    "TVL is the sum of all assets held by the PMI vault — USDC buffer plus the underlying index tokens (UMA, WMATIC, GNO) purchased via Uniswap V3.",
  start: 85617867,
  polygon: {
    tvl: sumTokensExport({
      owner: PMI_VAULT,
      tokens: [USDC, UMA, WMATIC, GNO],
    }),
  },
};