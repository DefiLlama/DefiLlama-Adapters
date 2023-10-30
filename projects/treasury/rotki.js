const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x9531C059098e3d194fF87FebB587aB07B30B1306";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC, // USDC
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.DAI,
      "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72",
      "0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4",
      "0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC",
      ADDRESSES.ethereum.sUSD,
      ADDRESSES.ethereum.MKR
    ],
    owners: [treasury],
    ownTokens: [],
  },
  optimism: {
    tokens: [
        nullAddress,
        ADDRESSES.optimism.USDC,
        ADDRESSES.optimism.USDT,
        ADDRESSES.optimism.OP
    ],
    owners: [treasury]
  },
  arbitrum: {
    tokens: [
        nullAddress,
        ADDRESSES.arbitrum.USDC,
        ADDRESSES.arbitrum.USDT,
        ADDRESSES.arbitrum.ARB,
        ADDRESSES.arbitrum.DAI,
        ADDRESSES.arbitrum.WETH
    ],
    owners: [treasury]
  },
});