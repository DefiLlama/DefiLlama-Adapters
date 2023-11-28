const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xAF1823bACd8EDDA3b815180a61F8741fA4aBc6Dd";

module.exports = treasuryExports({
  base: {
    tokens: [ 
        nullAddress,
        ADDRESSES.base.USDbC, //USDbC
     ],
    owners: [treasury,],
  },
})