const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xd2135CfB216b74109775236E36d4b433F1DF507B";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC, // USDC
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.DAI,
      "0x8290333ceF9e6D528dD5618Fb97a76f268f3EDD4"
    ],
    owners: [treasury],
    ownTokens: [],
  },
});