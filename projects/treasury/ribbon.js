const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury
const treasury = "0xDAEada3d210D2f45874724BeEa03C7d4BBD41674";
const treasury2 = "0x42c1357aaa3243ea30c713cdfed115d09f10a71d"
const treasury3 = "0x6adeb4fddb63f08e03d6f5b9f653be8b65341b35"
const RBN = "0x6123B0049F904d730dB3C36a31167D9d4121fA6B";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      // Ethereum Assets
      nullAddress,
      "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0", // wstETH
      "0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32", // LDO
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      "0xae78736Cd615f374D3085123A210448E74Fc6393", // rETH
      "0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84", // stETH
      "0xba100000625a3754423978a60c9317c58a424e3D", // BAL
      "0x4d224452801ACEd8B2F0aebE155379bb5D594381", // APE
      "0x090185f2135308BaD17527004364eBcC2D37e5F6", // SPELL
      "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", // UNI
      "0x5aFE3855358E112B5647B952709E6165e1c1eEEe", // SAFE
      "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE", // yvUSDC
      "0x25751853Eab4D0eB3652B5eB6ecB102A2789644B", // rETH-THETA
    ],
    owners: [treasury, treasury2, treasury3],
    ownTokens: [
      RBN,
      "0xd590931466cdD6d488A25da1E89dD0539723800c", // 50RBN-50USDC
    ],
  },
});
