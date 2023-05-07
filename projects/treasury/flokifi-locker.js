const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryETH = "0x2b9d5c7f2EAD1A221d771Fb6bb5E35Df04D60AB0";
const flokiETH = "0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E"

const treasuryBSC = "0x17e98a24f992BB7bcd62d6722d714A3C74814B94"
const flokiBSC = "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xca7c2771D248dCBe09EABE0CE57A62e18dA178c0",
        "0xdAC17F958D2ee523a2206206994597C13D831ec7",
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        "0x1BD708E01E96d426652b0D50b8c896eaeefee36d"
     ],
    owners: [treasuryETH],
    ownTokens: [flokiETH],
  },
  bsc: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasuryBSC],
    ownTokens: [flokiBSC],
  },
})