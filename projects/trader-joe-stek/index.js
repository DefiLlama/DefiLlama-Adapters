const {  nullAddress,treasuryExports } = require("../helper/treasury");

const stakingContract = "0xb22c6d1c2897b950fc1040913c0d84d788f24df2";


module.exports = treasuryExports({

  avax: {
    tokens: [ 
        nullAddress,
        "0xEbB5d4959B2FbA6318FbDa7d03cd44aE771fc999", // kong
        "0x5ac04b69bde6f67c0bd5d6ba6fd5d816548b066a", // tech 
        "0x8ad25b0083c9879942a64f00f20a70d3278f6187", // meow
     ],
    owners: [stakingContract],
    ownTokens: [],
  }
})