const {  nullAddress,treasuryExports } = require("../helper/treasury");

const klimaTreasury1 = "0x7dd4f0b986f032a44f913bf92c9e8b7c17d77ad7";

const KLIMA = "0x4e78011ce80ee02d2c3e649fb657e45898257815";


module.exports = treasuryExports({
  polygon: {
    tokens: [ 
        nullAddress,
        '0x2F800Db0fdb5223b3C3f354886d907A671414A7F',//BCT
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',//USDC
        '0xD838290e877E0188a4A44700463419ED96c16107',//NCT
     ],
    owners: [klimaTreasury1],
    ownTokenOwners: [klimaTreasury1],
    ownTokens: [KLIMA],
  },
})