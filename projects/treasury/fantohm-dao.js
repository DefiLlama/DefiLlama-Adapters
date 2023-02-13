const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xA3b52d5A6d2f8932a5cD921e09DA840092349D71";

module.exports = treasuryExports({
  fantom: {
    tokens: [ 
        nullAddress,
        "0x6Fc9383486c163fA48becdEC79d6058f984f62cA",//USDB
        "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75",//USDC
        "0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E",//DAI
        "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83",//WFTM
     ],
    owners: [treasury,],
  },
})