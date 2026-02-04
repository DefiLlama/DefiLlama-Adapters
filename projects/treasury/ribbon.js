const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

// Treasury
const treasury = "0xDAEada3d210D2f45874724BeEa03C7d4BBD41674";
const treasury2 = "0x42c1357aaa3243ea30c713cdfed115d09f10a71d"
const treasury3 = "0x6adeb4fddb63f08e03d6f5b9f653be8b65341b35"
const RBN = "0x6123B0049F904d730dB3C36a31167D9d4121fA6B";
const AEVO = ADDRESSES.ethereum.AEVO

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      // Ethereum Assets
      nullAddress,
      ADDRESSES.ethereum.WSTETH,
      ADDRESSES.ethereum.LIDO,
      ADDRESSES.ethereum.WETH,
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.RETH,
      ADDRESSES.ethereum.STETH,
      "0xba100000625a3754423978a60c9317c58a424e3D", // BAL
      "0x4d224452801ACEd8B2F0aebE155379bb5D594381", // APE
      "0x090185f2135308BaD17527004364eBcC2D37e5F6", // SPELL
      ADDRESSES.ethereum.UNI,
      ADDRESSES.ethereum.SAFE,
      "0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE", // yvUSDC
      "0x25751853Eab4D0eB3652B5eB6ecB102A2789644B", // rETH-THETA
    ],
    owners: [treasury, treasury2, treasury3],
    ownTokens: [
      RBN,
      "0xd590931466cdD6d488A25da1E89dD0539723800c", // 50RBN-50USDC
      AEVO
    ],
  },
});
