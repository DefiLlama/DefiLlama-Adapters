const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x5efda50f22d34F262c29268506C5Fa42cB56A1Ce";
const vesting = "0x179f48C78f57A3A78f0608cC9197B8972921d1D2";
const TORN = "0x77777FeDdddFfC19Ff86DB637967013e6C6A116C";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress
     ],
    owners: [treasury, vesting],
    ownTokens: [TORN],
  },
})