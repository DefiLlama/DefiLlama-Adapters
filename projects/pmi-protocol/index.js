const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokensExport } = require("../helper/unwrapLPs");

const PMI_VAULT = "0x9DD6641423200b1FBd0BFF45f376BEE66Be1F4E4";

const USDC = ADDRESSES.polygon.USDC_CIRCLE;
const UMA = "0x3066818837c5e6eD6601bd5a91B0762877A6B731";
const WMATIC = ADDRESSES.polygon.WMATIC_2;
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