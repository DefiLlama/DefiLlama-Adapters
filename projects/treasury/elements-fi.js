
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x978982772b8e4055b921bf9295c0d74eb36bc54e";

module.exports = treasuryExports({
  arbitrum: {
    owners: [treasury, ],
    ownTokens: [
      '0x30123A6D38eb4a34B701627211EDE0BFF04Cd618', // ELMT
    ],
    tokens: [
      nullAddress,
    ],
  },
});