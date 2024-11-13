const ADDRESSES = require('../helper/coreAssets.json')
const {  nullAddress,treasuryExports } = require("../helper/treasury");

const treasury = "0x015B5FD572De0a7C1478075e1710a0505184520d";

const MOR = "0x43F2acbaE09272021AFC107180Aa0ee313B00D8F";

module.exports = treasuryExports({
  polygon: {
    tokens: [ 
        nullAddress,
        ADDRESSES.polygon.USDC,//USDC
        ADDRESSES.polygon.WETH_1//weth
     ],
    owners: [treasury],
    ownTokens: [MOR],
  },
})