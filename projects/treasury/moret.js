const {  nullAddress,treasuryExports } = require("../helper/treasury");

const treasury = "0x015B5FD572De0a7C1478075e1710a0505184520d";

const MOR = "0x43F2acbaE09272021AFC107180Aa0ee313B00D8F";

module.exports = treasuryExports({
  polygon: {
    tokens: [ 
        nullAddress,
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',//USDC
        '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'//weth
     ],
    owners: [treasury],
    ownTokens: [MOR],
  },
})