const { nullAddress, treasuryExports } = require("../helper/treasury");

// The Mosh treasury: a Safe on Robinhood Chain that receives Mosh's share of bundle fees and the raise
// fees, and backs bundles itself. Further treasury wallets go in `owners`.
const MOSH_TREASURY = "0x6736b8bc65f110e02ca4f681fd84375940f37da6";

module.exports = treasuryExports({
  robinhood: {
    owners: [MOSH_TREASURY],
    tokens: [
      nullAddress,
      "0x5fc5360d0400a0fd4f2af552add042d716f1d168", // USDG
      "0xc9a981fee1f9dec688bb123ccdecc63d0debfc4e", // GLD
    ],
    ownTokens: ["0x07ebb29a38fbcb41563817e5e19f2cec619c90d2"], // BUN
  },
});
