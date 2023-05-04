const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xdb08917e0ae9075c6577b6a11d0bb78dfbc381e4";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
  },
})