const { treasuryExports } = require("../helper/treasury");

const treasury = "0x689ac37b02a36e77d2ad1ea7d923a05233a0d8e2";

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury],
    ownTokens: ["0x8e729198d1C59B82bd6bBa579310C40d740A11C2"] // ALVA
  },
})
