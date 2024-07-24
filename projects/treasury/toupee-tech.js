const {treasuryExports } = require("../helper/treasury");

const treasury = "0x0cf24278c99d60388dd8a3a663937f1b9f934d09";
const WIG = "0x58Dd173F30EcfFdfEbCd242C71241fB2f179e9B9"


module.exports = treasuryExports({
  base: {
    owners: [treasury],
    ownTokens: [WIG],
  },
})