const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury
const treasury = "0xDAEada3d210D2f45874724BeEa03C7d4BBD41674";
const RBN = "0x6123B0049F904d730dB3C36a31167D9d4121fA6B";
const rbnWeth = "0xdb44a4a457c87225b5ba45f27b7828a4cc03c112";

module.exports = treasuryExports({
  ethereum: {
    tokens: [ 
        // Ethereum Assets
        nullAddress,
        "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",//weth
        "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",//wbtc
        "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",//usdc
        "0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9",//aave
        "0xba100000625a3754423978a60c9317c58a424e3D",//bal
        "0xae78736Cd615f374D3085123A210448E74Fc6393",//reth
        "0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0",//wsteth
        "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32",//ldo
     ],
    owners: [treasury],
    ownTokens: [RBN, rbnWeth]
  },
})
