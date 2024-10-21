const { sumTokensExport } = require("../helper/unwrapLPs");
const coreAssets = require("../helper/coreAssets.json");

const TAIKO_TOKEN = "0xA9d23408b9bA935c230493c40C73824Df71A0975";

const CONTRACTS = ["0x2c301eBfB0bb42Af519377578099b63E921515B7", "0xD8F7cd7d919c5266777FB83542F956dD30E80187", "0x12689b6ddE632E69fBAA70d066f86aC9fDd33dd1"];

// Crack & Stack
// https://crackandstack.com/
module.exports = {
  methodology: `Crack & Stack TVL is the backed value of the Lanterns NFT.`,
  taiko: {
    tvl: sumTokensExport({
      owners: CONTRACTS,
      tokens: [coreAssets.null, coreAssets.taiko.USDT, coreAssets.taiko.USDC_e, coreAssets.taiko.USDC, TAIKO_TOKEN]
    }),
  },
}
