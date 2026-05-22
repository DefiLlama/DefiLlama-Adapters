const { treasuryExports } = require("../helper/treasury");

const treasury = "0x202065dFb813295D0B095A39E36E3b3296210505";

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury,],
  },
})