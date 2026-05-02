const ADDRESSES = require('../helper/coreAssets.json')

const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0xb35096b074fdb9bBac63E3AdaE0Bbde512B2E6b6";

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury],
    ownTokens: [
      "0x9d65ff81a3c488d585bbfb0bfe3c7707c7917f54", // SSV
    ],
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.USDC,
      ADDRESSES.ethereum.ETHFI,
      ADDRESSES.ethereum.SAFE,
      ADDRESSES.ethereum.DAI,
      ADDRESSES.ethereum.DAI,
    ],
  },
});
