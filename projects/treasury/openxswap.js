const { nullAddress, treasuryExports } = require("../helper/treasury");

const Treasury = "0x6b479f4bcf0321c370d266b592fd44eb0fc47ca8";
const OpenX = "0xc3864f98f2a61A7cAeb95b039D031b4E2f55e0e9";
const xOpenX = "0x2513486f18eeE1498D7b6281f668B955181Dd0D9"



module.exports = treasuryExports({
  optimism: {
    tokens: [ 
        nullAddress,
        '0x3c8B650257cFb5f272f799F5e2b4e65093a11a05',//velo
        '0x46f21fDa29F1339e0aB543763FF683D399e393eC'

     ],
    owners: [Treasury],
    ownTokens: [OpenX, xOpenX],
  },
})