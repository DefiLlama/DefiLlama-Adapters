const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const floorTreasury1 = "0x91E453f442d25523F42063E1695390e325076ca2";
const floorTreasury2 = "0xa9d93a5cca9c98512c8c56547866b1db09090326";

const FLOOR = "0xf59257e961883636290411c11ec5ae622d19455e";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        ADDRESSES.ethereum.WETH,//WETH
        ADDRESSES.ethereum.USDC,//USDC
     ],
    owners: [floorTreasury1, floorTreasury2],
    ownTokens: [FLOOR],
  },
})
