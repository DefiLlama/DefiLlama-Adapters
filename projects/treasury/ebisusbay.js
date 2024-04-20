
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x289A94c5cf403691aca3d222E30335a4957b3ae6";

module.exports = treasuryExports({
  cronos: {
    owners: [treasury],
    ownTokens: [
      '0xaF02D78F39C0002D14b95A3bE272DA02379AfF21', // FRTN
    ],
    tokens: [
      nullAddress,
    ],
  },
});