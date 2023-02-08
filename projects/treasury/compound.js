const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x9467cfADC9DE245010dF95Ec6a585A506A8ad5FC";
const INDEX = "0x0954906da0Bf32d5479e25f46056d22f08464cab";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress
     ],
    owners: [treasury],
    ownTokens: [INDEX],
  },
})