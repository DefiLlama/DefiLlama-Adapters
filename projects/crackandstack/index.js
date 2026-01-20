
const { sumTokensExport } = require("../helper/unwrapLPs");
const ADDRESSES = require("../helper/coreAssets.json");

const CONTRACTS = ["0x2c301eBfB0bb42Af519377578099b63E921515B7", "0xD8F7cd7d919c5266777FB83542F956dD30E80187", "0x12689b6ddE632E69fBAA70d066f86aC9fDd33dd1"];

// Crack & Stack
// https://crackandstack.com/
module.exports = {
  methodology: `Crack & Stack TVL is the backed value of the Lanterns NFT.`,
  taiko: {
    tvl: sumTokensExport({
      owners: CONTRACTS,
      tokens: [ADDRESSES.null, ADDRESSES.taiko.USDT, ADDRESSES.taiko.USDC_e, ADDRESSES.taiko.USDC, ADDRESSES.taiko.TAIKO]
    }),
  },
}
