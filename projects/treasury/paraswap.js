const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x5A61D9214adEFD7669428a03A4e8734A00E9F464";
const PARA = "0xcAfE001067cDEF266AfB7Eb5A286dCFD277f3dE5";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress
     ],
    owners: [treasury],
    ownTokens: [PARA],
  },
})