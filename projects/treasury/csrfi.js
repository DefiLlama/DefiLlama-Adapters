const { nullAddress,treasuryExports } = require("../helper/treasury");

const treasury = "0x8dD3547A42e7FE5aE30B8dC42C570ebE6838dFA2";


module.exports = treasuryExports({
  canto: {
    tokens: [
        nullAddress
    ],
    owners: [treasury]    
  },
})