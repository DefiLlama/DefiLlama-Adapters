const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const Treasury = "0x58c37a622cdf8ace54d8b25c58223f61d0d738aa";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [],
    owners: [Treasury],
  },
  ethereum: {
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.USDT,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.SUSHI,
      ADDRESSES.ethereum.SAFE, 
    ],
    owners: [Treasury],
    ownTokens: ['0x767fe9edc9e0df98e07454847909b5e959d7ca0e'],
  }
})