const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xA3b52d5A6d2f8932a5cD921e09DA840092349D71";

module.exports = treasuryExports({
  fantom: {
    tokens: [ 
        nullAddress,
        "0x6Fc9383486c163fA48becdEC79d6058f984f62cA",//USDB
        ADDRESSES.fantom.USDC,//USDC
        ADDRESSES.fantom.DAI,//DAI
        ADDRESSES.fantom.WFTM,//WFTM
     ],
    owners: [treasury,],
  },
})