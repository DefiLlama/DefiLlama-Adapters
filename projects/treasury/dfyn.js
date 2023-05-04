const {  nullAddress,treasuryExports } = require("../helper/treasury");

const Treasury = "0x5C35D4BcF0827a22370915E75c387EC470338c10";



module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8",
        "0x8971dFb268B961a9270632f28B24F2f637c94244"
     ],
    owners: [Treasury],
  },
})