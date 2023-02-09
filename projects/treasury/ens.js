const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7";
const vestingAddress = "0xd7a029db2585553978190db5e85ec724aa4df23f"


const ENS= "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", //USDC
     ],
    owners: [treasury, vestingAddress],
    ownTokens: [ENS],
  },
})