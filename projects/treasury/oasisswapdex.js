const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xe0a9B8DeF6d85eb7D828f706635402334D564b0f";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [ 
        nullAddress,
        "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", //USDC
     ],
    owners: [treasury,],
  },
})