const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x06b6f37af314f19fea6b1940b2ca2c38c158b45476a70eb8874bd17be7b65c8b";



module.exports = treasuryExports({
  aptos: {
    tokens: [ 
        nullAddress,
        ADDRESSES.aptos.APT,
        ADDRESSES.aptos.amAPT,
        ADDRESSES.aptos.stApt,
     ],
    owners: [treasury]
  },
})
