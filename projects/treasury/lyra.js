const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x2ccf21e5912e9ecccb0ecdee9744e5c507cf88ae";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
  },
})