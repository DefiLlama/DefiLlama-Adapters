// evently (formerly Megamble) — Prediction markets on MegaETH
// Domain: evently.market | X: @eventlymarket
// Chain: MegaETH Mainnet (ID 4326)
// Contract V2: 0x7c56aa113be4a867936c55013b03387c7b9cd41a

const { sumTokensExport } = require("../helper/unwrapLPs");

// USDM — MegaETH native stablecoin (base token for all markets)
const USDM = "0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7";
const CONTRACT_V2 = "0x7c56aa113be4a867936c55013b03387c7b9cd41a";

module.exports = {
  megaeth: {
    tvl: sumTokensExport({
      owners: [CONTRACT_V2],
      tokens: [USDM],
    }),
  },
  methodology:
    "TVL is the total USDM locked in evently prediction market contracts on MegaETH.",
};
