const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasuryAVAX = "0xb54382c680b0ad037c9f441a8727ca6006fe2dd0";
const treasuryETH = "0xfa2d1f15557170f6c4a4c5249e77f534184cdb79"
const WOO = "0x4691937a7508860F876c9c0a2a617E7d9E945D4B"
const WOOBSC= "0x4691937a7508860F876c9c0a2a617E7d9E945D4B"
const LP = "0x2FC8bC3eE171eD5610ba3093909421E90b47Fc07"
const treasuryBSC = "0xfd899c7c5ed84537e2acfc998ce26c3797654ae8"

module.exports = treasuryExports({
  avax: {
    tokens: [ 
        nullAddress,
        "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"
     ],
    owners: [treasuryAVAX],
  },
  ethereum: {
    tokens: [ 
        nullAddress,
        "0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd",
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
        
     ],
    owners: [treasuryETH],
    ownTokens: [WOO, LP],
    resolveLP: true,
    resolveUniV3: true,
  },
  bsc: {
    tokens: [ 
        nullAddress,
        "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"
     ],
    owners: [treasuryBSC],
    ownTokens: [WOOBSC],
  },
})