const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x336DEe4022d6CC2F95cfe9e0949B9E0EDDAC457D";

module.exports = treasuryExports({
  optimism: {
    tokens: [
        nullAddress,
      ADDRESSES.optimism.USDC, // USDC
      ADDRESSES.optimism.OP
    ],
    owners: [treasury],
    ownTokens: [],
  },
});
