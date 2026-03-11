
const { treasuryExports } = require("../helper/treasury");

const treasury = "0xc918a60e4d40d15959a85fa8b35f6db96907babf";

module.exports = treasuryExports({
  optimism: {
    owners: [treasury, ],
    ownTokens: [   
     ],
    tokens: [
    ],
  },
  base: {
    owners: [treasury, ],
    ownTokens: [   
     ],
    tokens: [
    ],
  },
});