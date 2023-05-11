const { treasuryExports, nullAddress } = require("../helper/treasury");

const treasury = "0xf6bc2e3b1f939c435d9769d078a6e5048aabd463";
const SPOOL = "0x40803cEA2b2A32BdA1bE61d3604af6a814E70976"
const LP = "0xF3b675df63FB4889180d290A338fc15C0766fd64"

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

    ],
    owners: [treasury],
    ownTokens: [SPOOL, LP],
  },
});
