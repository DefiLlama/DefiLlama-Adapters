const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x4D9339dd97db55e3B9bCBE65dE39fF9c04d1C2cd";

module.exports = treasuryExports({
  optimism: {
    tokens: [
      nullAddress,
      ADDRESSES.optimism.USDC, // USDC
      ADDRESSES.optimism.OP,
      ADDRESSES.optimism.DAI,
      ADDRESSES.optimism.USDT,
      ADDRESSES.optimism.WETH
    ],
    owners: [treasury],
    ownTokens: [],
  },
  ethereum: {
    tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC, // USDC
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.WETH,
        "0x7C07F7aBe10CE8e33DC6C5aD68FE033085256A84", //icETH
        "0x1d462414fe14cf489c7A21CaC78509f4bF8CD7c0", //can
        "0xa117000000f279D81A1D3cc75430fAA017FA5A2e", //ant
        "0x19062190B1925b5b6689D7073fDfC8c2976EF8Cb", //bzz
        "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", //ens
        "0x2d94AA3e47d9D5024503Ca8491fcE9A2fB4DA198", //bank
        "0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F", //gtc
        ADDRESSES.ethereum.YFI, //yfi
        ADDRESSES.ethereum.MATIC, //matic
        "0xDd1Ad9A21Ce722C151A836373baBe42c868cE9a4", //ubi
      ],
      owners: [treasury],
      ownTokens: ["0x900dB999074d9277c5DA2A43F252D74366230DA0"],
  },
  polygon: {
    tokens: [
        nullAddress,
        ADDRESSES.polygon.USDC, // USDC
        ADDRESSES.polygon.DAI,
        ADDRESSES.polygon.USDT,
        ADDRESSES.polygon.WETH,
        ADDRESSES.polygon.WMATIC,
        "0x18e73A5333984549484348A94f4D219f4faB7b81", //duckies
        "0xD6DF932A45C0f255f85145f286eA0b292B21C90B", //aave
        "0x53E0bca35eC356BD5ddDFebbD1Fc0fD03FaBad39", //link
        "0xb33EaAd8d922B1083446DC23f610c2567fB5180f", //uni
      ],
      owners: [treasury],
      ownTokens: [],
  },
  xdai: {
    tokens: [
        nullAddress,
        "0x71850b7E9Ee3f13Ab46d67167341E4bDc905Eef9", //hny
        ADDRESSES.xdai.USDC, //usdc
        "0x21a42669643f45Bc0e086b8Fc2ed70c23D67509d", //fox
        "0x83FF60E2f93F8eDD0637Ef669C69D5Fb4f64cA8E", //bright
        ADDRESSES.xdai.WETH, //weth
        ADDRESSES.xdai.WXDAI, //wxdai
        "0x177127622c4A00F3d409B75571e12cB3c8973d3c", //cow
      ],
      owners: [treasury],
      ownTokens: ["0x4f4F9b8D5B4d0Dc10506e5551B0513B61fD59e75"],
  }
});