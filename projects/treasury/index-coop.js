const { Indexed } = require("ethers/lib/utils");
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const indexTreasury = "0x9467cfADC9DE245010dF95Ec6a585A506A8ad5FC";

const INDEX = "0x0954906da0Bf32d5479e25f46056d22f08464cab";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0x5aFE3855358E112B5647B952709E6165e1c1eEEe',//SAFE
     ],
    owners: [indexTreasury],
    ownTokens: [INDEX],
  },
})