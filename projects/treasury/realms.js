const ADDRESSES = require('../helper/coreAssets.json');
const { treasuryExports } = require("../helper/treasury");

const treasury = "0xa8e6efaf015d424c626cf3c23546fcb3bd2c9f1a";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
        ADDRESSES.null,
        ADDRESSES.ethereum.WETH
     ],
    owners: [treasury],
    ownTokens: ["0x686f2404e77ab0d9070a46cdfb0b7fecdd2318b0"], // LORDS GOVERNANCE TOKEN
  },
})
