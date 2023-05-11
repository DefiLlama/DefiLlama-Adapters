const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x19Ff5f2C05aC6a303aF6d5002C99686e823EBE72";
const push = "0xf418588522d5dd018b425E472991E52EBBeEEEEE"

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury],
    ownTokens: [push],
    tokens: [
      nullAddress,
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
      "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      "0xAf31Fd9C3B0350424BF96e551d2D1264d8466205",
      "0x6B175474E89094C44Da98b954EedeAC495271d0F",
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599",
      "0x5aFE3855358E112B5647B952709E6165e1c1eEEe"
    ],
  },
});