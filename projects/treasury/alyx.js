const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x576182b7a1b0bC67701ead28a087228c50Aa0982";



module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
        "0x55d398326f99059fF775485246999027B3197955"
     ],
    owners: [treasury]
  },
})
