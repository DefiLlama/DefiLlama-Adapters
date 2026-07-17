// Hood Index (hMAG7) — fully-backed on-chain index of the seven MAG7 stock
// tokens on Robinhood Chain (chainId 4663).
//
// TVL = the stock tokens (AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA) held as
// collateral in the hMAG7 IndexVault. The index is fully backed and mints/
// redeems in-kind; NAV is priced via Chainlink feeds. No leverage, no
// rehypothecation.

const VAULT = "0x43e4aa3204A2d3cee2E12532195E9a6b766a3639"; // IndexVault (hMAG7)
const COMPONENTS = [
  "0xaF3D76f1834A1d425780943C99Ea8A608f8a93f9", // AAPL
  "0xe93237C50D904957Cf27E7B1133b510C669c2e74", // MSFT
  "0x2e0847E8910a9732eB3fb1bb4b70a580ADAD4FE3", // GOOGL
  "0x12f190a9F9d7D37a250758b26824B97CE941bF54", // AMZN
  "0xd0601CE157Db5bdC3162BbaC2a2C8aF5320D9EEC", // NVDA
  "0xc0D6457C16Cc70d6790Dd43521C899C87ce02f35", // META
  "0x322F0929c4625eD5bAd873c95208D54E1c003b2d", // TSLA
];

const { sumTokensExport } = require("../helper/unwrapLPs");

module.exports = {
  methodology:
    "TVL is the value of the seven Robinhood Chain stock tokens (MAG7: AAPL, MSFT, GOOGL, AMZN, NVDA, META, TSLA) held as collateral in the hMAG7 IndexVault. The index is fully backed and mints/redeems in-kind; NAV is priced via Chainlink feeds. There is no leverage and no rehypothecation.",
  start: 8_900_000, // vault deploy block
  robinhood: {
    tvl: sumTokensExport({ owner: VAULT, tokens: COMPONENTS }),
  },
};
