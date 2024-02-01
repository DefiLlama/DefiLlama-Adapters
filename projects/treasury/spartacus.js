const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const sparTreasury1 = "0x8CFA87aD11e69E071c40D58d2d1a01F862aE01a8";

const SPA = "0x5602df4a94eb6c680190accfa2a475621e0ddbdc";


module.exports = treasuryExports({
  fantom: {
    tokens: [ 
        nullAddress,
        ADDRESSES.fantom.DAI,//DAI
        ADDRESSES.fantom.WFTM,//WFTM
     ],
    owners: [sparTreasury1],
    ownTokens: [SPA],
  },
})