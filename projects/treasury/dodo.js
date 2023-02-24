const {  nullAddress,treasuryExports } = require("../helper/treasury");

const dodoTreasury = "0xAB21016BD4127638b8c555e36636449b33dF1C38";

const DODO = "0x43dfc4159d86f3a37a5a4b3d4580b888ad7d4ddd";


module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        '0xdAC17F958D2ee523a2206206994597C13D831ec7',//TETHER
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',//USDC
     ],
    owners: [dodoTreasury],
    ownTokens: [DODO],
  },
})