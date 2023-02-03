const {  nullAddress,treasuryExports } = require("../helper/treasury");

const floorTreasury1 = "0x91E453f442d25523F42063E1695390e325076ca2";

const FLOOR = "0xf59257e961883636290411c11ec5ae622d19455e";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',//WETH
     ],
    owners: [floorTreasury1],
    ownTokenOwners: [floorTreasury1],
    ownTokens: [FLOOR],
  },
})