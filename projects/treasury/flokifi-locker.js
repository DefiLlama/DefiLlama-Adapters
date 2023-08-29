const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryETH = "0x2b9d5c7f2EAD1A221d771Fb6bb5E35Df04D60AB0";
const treasuryETH2 = "0xea9a5a3Ac7545E1Ddce79fC5803Df0f317A3D0f6"
const flokiETH = "0xcf0C122c6b73ff809C693DB761e7BaeBe62b6a2E"

const treasuryBSC = "0x17e98a24f992BB7bcd62d6722d714A3C74814B94"
const flokiBSC = "0xfb5B838b6cfEEdC2873aB27866079AC55363D37E"

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        nullAddress,
        "0xca7c2771D248dCBe09EABE0CE57A62e18dA178c0",
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.USDC,
        "0x1BD708E01E96d426652b0D50b8c896eaeefee36d"
     ],
    owners: [treasuryETH, treasuryETH2],
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