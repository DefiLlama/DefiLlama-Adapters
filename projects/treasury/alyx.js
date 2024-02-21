const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x576182b7a1b0bC67701ead28a087228c50Aa0982";



module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        ADDRESSES.bsc.WBNB,
        ADDRESSES.bsc.USDT
     ],
    owners: [treasury]
  },
})
