const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x2501c477d0a35545a387aa4a3eee4292a9a8b3f0";
const OP = "0x4200000000000000000000000000000000000042"

module.exports = treasuryExports({
  optimism: {
    tokens: [ 
        nullAddress,
        "0x7F5c764cBc14f9669B88837ca1490cCa17c31607"
     ],
    owners: [treasury],
    ownTokens: [OP],
  },
  ethereum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
    ownTokens: [],
  },
})