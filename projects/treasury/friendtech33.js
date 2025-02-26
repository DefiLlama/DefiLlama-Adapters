const { treasuryExports } = require("../helper/treasury");

const treasury = "0x68d91Bb4b1760Bc131555D23a438585D937A8e6d";

module.exports = treasuryExports({
  base: {
    owners: [treasury,],
    ownTokens: ['0x3347453Ced85bd288D783d85cDEC9b01Ab90f9D8'],
    resolveLP: true,
  },
})