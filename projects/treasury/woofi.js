const ADDRESSES = require('../helper/coreAssets.json')
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
        ADDRESSES.avax.USDC_e
     ],
    owners: [treasuryAVAX],
  },
  ethereum: {
    tokens: [ 
        nullAddress,
        "0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd",
        ADDRESSES.ethereum.USDC
        
     ],
    owners: [treasuryETH],
    ownTokens: [WOO, LP],
    resolveLP: true,
    resolveUniV3: true,
  },
  bsc: {
    tokens: [ 
        nullAddress,
        ADDRESSES.bsc.USDC
     ],
    owners: [treasuryBSC],
    ownTokens: [WOOBSC],
  },
})