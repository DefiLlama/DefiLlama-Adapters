// evently — Prediction markets on MegaETH
// Domain: evently.market | X: @eventlymarket
// Chain: MegaETH Mainnet (ID 4326)

const { sumTokensExport } = require("../helper/unwrapLPs");

// USDM — MegaETH native stablecoin (base token for all markets)
const USDM = "0xFAfDdbb3FC7688494971a79cc65DCa3EF82079E7";

// Contracts
const PROFILES_V1 = "0x9F0708145BCCD1F5B16F610cB8a75A63fA4A9a24";
const MARKETS_V3 = "TBD"; // EventlyMarketsV3 — pending deployment

module.exports = {
  megaeth: {
    tvl: sumTokensExport({
      owners: [PROFILES_V1], // MARKETS_V3 will be added upon deployment
      tokens: [USDM],
    }),
  },
  methodology:
    "TVL is the total USDM locked in evently smart contracts (Profiles + Prediction Markets V3) on MegaETH. " +
    "Fees: 2.5% per trade via LMSR pricing — 1% to market creator, 1% to protocol treasury, 0.5% to resolver. " +
    "Revenue: 1% of all trading volume goes to the protocol treasury. " +
    "Volume: sum of all USDM traded on prediction markets (TradeExecuted events). " +
    "EventlyMarketsV3 address is pending deployment and will be added upon launch.",
};
