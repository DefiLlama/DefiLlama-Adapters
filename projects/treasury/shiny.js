const { treasuryExports } = require("../helper/treasury");
const ADDRESSES = require('../helper/coreAssets.json')

const TREASURY = "0x8210c4a20dfA79F555560F77dc72BD7A846a3eF1";

module.exports = treasuryExports({
  base: {
    tokens: [ 
        ADDRESSES.base.USDC
     ],
    owners: [TREASURY],
  },
  abstract: {
    tokens: [ 
        ADDRESSES.abstract.USDC
     ],
    owners: [TREASURY],
  },
})