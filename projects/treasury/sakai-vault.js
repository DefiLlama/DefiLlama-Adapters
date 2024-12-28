const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const Treasury = "0x6b269c07e8f94f0fa1769cbd362879afea0206db";
const SAKAI = "0x43B35e89d15B91162Dea1C51133C4c93bdd1C4aF";


module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        ADDRESSES.bsc.USDT
     ],
    owners: [Treasury],
    ownTokens: [SAKAI],
  },
})