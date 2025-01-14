const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x19Ff5f2C05aC6a303aF6d5002C99686e823EBE72";
const push = "0xf418588522d5dd018b425E472991E52EBBeEEEEE"

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury],
    ownTokens: [push],
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      "0xAf31Fd9C3B0350424BF96e551d2D1264d8466205",
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.WBTC,
      ADDRESSES.ethereum.SAFE,
    ],
  },
});