
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryContract = "0x680b96DDC962349f59F54FfBDe2696652669ED60";
const WETH_OPTIMISM = "0x4200000000000000000000000000000000000006";



module.exports = treasuryExports({
  optimism: {
    tokens: [ 
        nullAddress,
        WETH_OPTIMISM
     ],
    owners: [treasuryContract],
    ownTokens: [],
  },
})
