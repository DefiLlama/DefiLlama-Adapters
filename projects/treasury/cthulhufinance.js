const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x371405Aea16D5916703C74580247196BA9EA531F";
const CTH = "0xF8e943f646816e4B51279B8934753821ED832Dca";


module.exports = treasuryExports({
  optimism: {
    tokens: [ 
        nullAddress
     ],
    owners: [treasury],
    ownTokens: [CTH],
  },
})
