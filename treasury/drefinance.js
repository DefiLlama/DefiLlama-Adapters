const ADDRESSES = require("../helper/coreAssets.json");
const { sumTokensExport } = require("../helper/unwrapLPs.js");
const { pool2s } = require("../helper/pool2");

const tokens = {
  USDC: ADDRESSES.sonic.USDC_e,
  DRE: "0xF8232259D4F92E44eF84F18A0B9877F4060B26F1",
  DRE_USDC_LP:  "0xB781C624397C423Cb62bAe9996cEbedC6734B76b",
}

const treasury = "0x0E43DF9F40Cc6eEd3eC70ea41D6F34329fE75986";

module.exports = {
  sonic: {
    tvl: sumTokensExport({
      owner: treasury,
      chain: "sonic",
      tokens: [tokens.USDC, tokens.DRE, tokens.DRE_USDC_LP],
    }),
    pool2: pool2s([treasury], [tokens.DRE_USDC_LP], "sonic"),
  },
};
