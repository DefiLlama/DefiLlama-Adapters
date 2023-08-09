const ADDRESSES = require('../helper/coreAssets.json')

const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryContract = "0x680b96DDC962349f59F54FfBDe2696652669ED60";
const WETH_OPTIMISM = ADDRESSES.tombchain.FTM;



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
