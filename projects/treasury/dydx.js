const {  nullAddress,treasuryExports } = require("../helper/treasury");

const dydxTreasury = "0xE710CEd57456D3A16152c32835B5FB4E72D9eA5b";

const DYDX = "0x92d6c1e31e14520e676a687f0a93788b716beff5";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//TETHER
     ],
    owners: [dydxTreasury],
    ownTokens: [DYDX],
  },
})