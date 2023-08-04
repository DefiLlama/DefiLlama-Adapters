const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x20a5c32ee19bcdb2635455859e64ba5a1d1acab2";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
  },
})