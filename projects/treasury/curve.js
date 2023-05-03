const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x25877b9413cc7832a6d142891b50bd53935fef82";

module.exports = treasuryExports({
  arbitrum: {
    owners: [treasury, ],
    ownTokens: [    ],
    tokens: [
      nullAddress,
    ],
  },
});