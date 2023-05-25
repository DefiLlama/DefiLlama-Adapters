const ADDRESSES = require('../helper/coreAssets.json')
const { treasuryExports, nullAddress } = require("../helper/treasury");

const Treasury = "0x58c37a622cdf8ace54d8b25c58223f61d0d738aa";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [],
    owners: [Treasury],
  },
  ethereum: {
    tokens: [nullAddress, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.USDT, ADDRESSES.ethereum.USDC, ADDRESSES.ethereum.SUSHI, '0x5afe3855358e112b5647b952709e6165e1c1eeee' ],
    owners: [Treasury],
    ownTokens: ['0x767fe9edc9e0df98e07454847909b5e959d7ca0e'],
  }
})