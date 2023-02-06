const { nullAddress, treasuryExports } = require("../helper/treasury");

const teamTokens = "0x5A7C5505f3CFB9a0D9A8493EC41bf27EE48c406D";
const SPELL = "0x090185f2135308BaD17527004364eBcC2D37e5F6";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress
     ],
    owners: [teamTokens],
    ownTokens: [SPELL],
  },
})
