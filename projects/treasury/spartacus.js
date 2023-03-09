const {  nullAddress,treasuryExports } = require("../helper/treasury");

const sparTreasury1 = "0x8CFA87aD11e69E071c40D58d2d1a01F862aE01a8";

const SPA = "0x5602df4a94eb6c680190accfa2a475621e0ddbdc";


module.exports = treasuryExports({
  fantom: {
    tokens: [ 
        nullAddress,
        '0x8D11eC38a3EB5E956B052f67Da8Bdc9bef8Abf3E',//DAI
        '0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83',//WFTM
     ],
    owners: [sparTreasury1],
    ownTokens: [SPA],
  },
})