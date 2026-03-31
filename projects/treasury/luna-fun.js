const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x6b198Ff4e0e3E3FB07a8A0bC09e8F7BE9fc608F5";

module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        ADDRESSES.bsc.WBNB,
     ],
    owners: [treasury,],
  },
})