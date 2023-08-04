const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xF548a58DB6d86d466acd00Fc0F6De3b39Ea129D7";


const EMP= "0x0DDCE00654f968DeD59A444da809F2B234047aB1";


module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.arbitrum.ARB, //ARB
        ADDRESSES.arbitrum.USDC, //USDC
     ],
    owners: [treasury],
    ownTokens: [EMP],
  },
})