const { nullAddress, treasuryExports } = require("../helper/treasury");

const ftm = "0xdFf234670038dEfB2115Cf103F86dA5fB7CfD2D2";
const bsc = "0x7C780b8A63eE9B7d0F985E8a922Be38a1F7B2141";
const heco = "0xdbB72c8B7eBdD52A4813B9D262386dfDAB69c9bA";
const polygon = "0xe37dD9A535c1D3c9fC33e3295B7e08bD1C42218D";
const arbitrum = "0x3f5eddad52C665A4AA011cd11A21E1d5107d7862";
const harmony = "0x523154a03180FD1CB26F39087441c9F91BcD0389";
const moonriver = "0x617f12E04097F16e73934e84f35175a1B8196551";
const avalanche = "0x26dE4EBffBE8d3d632A292c972E3594eFc2eCeEd";
const metis = "0x0f9602B7E7146a9BaE16dB948281BebDb7C2D095";
const optimism = "0x4ABa01FB8E1f6BFE80c56Deb367f19F35Df0f4aE";
const eth = "0xc9C61194682a3A5f56BF9Cd5B59EE63028aB6041";

module.exports = treasuryExports({
  fantom: {
    tokens: [
      nullAddress,
      "0x321162Cd933E2Be498Cd2267a90534A804051b11", // BTC
      "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", // USDC
      "0x21be370D5312f44cB42ce377BC9b8a0cEF1A4C83", // WFTM
    ],
    owners: [ftm],
    ownTokens: ["0xd6070ae98b8069de6B494332d1A1a81B6179D960"],
  },
  bsc: {
    tokens: [
      nullAddress,
      "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c", // WBNB
      "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56", // BUSD
    ],
    owners: [bsc],
    ownTokens: ["0xCa3F508B8e4Dd382eE878A314789373D80A5190A"],
  },
  heco: {
    tokens: [
      nullAddress,
      "0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f", // WHT
    ],
    owners: [heco],
    ownTokens: ["0x765277eebeca2e31912c9946eae1021199b39c61"],
  },
  polygon: {
    tokens: [
      nullAddress,
      "0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270", // WMATIC
      "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174", // USDC
    ],
    owners: [polygon],
    ownTokens: ["0xFbdd194376de19a88118e84E279b977f165d01b8"],
  },
  arbitrum: {
    tokens: [
      nullAddress,
      "0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8", // USDC
      "0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60", // LDO
      "0x82aF49447D8a07e3bd95BD0d56f35241523fBab1", // WETH
    ],
    owners: [arbitrum],
    ownTokens: [
      "0x99C409E5f62E4bd2AC142f17caFb6810B8F0BAAE",
      "0xcDA9B8e5867b5746755fE6E505B6300a76b2fAc3", // BIFI-WETH SLP
    ],
  },
  harmony: {
    tokens: [
      nullAddress,
      "0xcF664087a5bB0237a0BAd6742852ec6c8d69A27a", // WONE
    ],
    owners: [harmony],
    ownTokens: ["0x6ab6d61428fde76768d7b45d8bfeec19c6ef91a8"],
  },
  moonriver: {
    tokens: [
      nullAddress,
      "0xE3F5a90F9cb311505cd691a46596599aA1A0AD7D", // USDC
      "0x98878B06940aE243284CA214f92Bb71a2b032B8A", // WMOVR
    ],
    owners: [moonriver],
    ownTokens: [
      "0x173fd7434b8b50df08e3298f173487ebdb35fd14",
      "0xaC726ee53edFAe5f8f4C2c0d611Fd71D58E743bA", // BIFI-WMOVR SLP
    ],
  },
  avax: {
    tokens: [
      nullAddress,
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
    ],
    owners: [avalanche],
    ownTokens: [
      "0xd6070ae98b8069de6B494332d1A1a81B6179D960",
      "0x361221991B3B6282fF3a62Bc874d018bfAF1f8C8", // BIFI-WAVAX JLP
    ],
  },
  metis: {
    tokens: [
      nullAddress,
      "0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000", // METIS
      "0xEA32A96608495e54156Ae48931A7c20f0dcc1a21", // USDC
    ],
    owners: [metis],
    ownTokens: [
      "0xe6801928061cdbe32ac5ad0634427e140efd05f9",
      "0x89D433e8cCC871B3f12EA17b651ff3633DFb5DC0", // BIFI-METIS NLP
    ],
  },
  optimism: {
    tokens: [
      nullAddress,
      "0x4200000000000000000000000000000000000042", // OP
      "0x7F5c764cBc14f9669B88837ca1490cCa17c31607", // USDC
      "0xFdb794692724153d1488CcdBE0C56c252596735F", // LDO
    ],
    owners: [optimism],
    ownTokens: [
      "0x0234Ed3eD84639e930e7e49Be557e2Ed83BDe32e", // Moo Velo BIFI-OP
      "0x3532b6f723948eF39d5DCf44C16855239aF81082", // Moo Velo ETH-BIFI
    ],
  },
  ethereum: {
    tokens: [
      nullAddress,
      "0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599", // WBTC
      "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", // USDC
      "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", // WETH
      "0x5aFE3855358E112B5647B952709E6165e1c1eEEe", // SAFE
    ],
    owners: [eth],
    ownTokens: [
      "0x5870700f1272a1AdbB87C3140bD770880a95e55D",
      "0x6660fd0a97Af41c6A7b29450D3532FeDdBe0478A", // Moo Monolith BIFI-ETH
    ],
  },
});
