const { nullAddress, treasuryExports } = require("../helper/treasury");

const Treasury = "0x6b269c07e8f94f0fa1769cbd362879afea0206db";
const SAKAI = "0x43B35e89d15B91162Dea1C51133C4c93bdd1C4aF";


module.exports = treasuryExports({
  bsc: {
    tokens: [ 
        nullAddress,
        "0x55d398326f99059fF775485246999027B3197955"
     ],
    owners: [Treasury],
    ownTokens: [SAKAI],
  },
})