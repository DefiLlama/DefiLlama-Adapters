const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x3E87e5BCE4dEb09FeE5045EF15E18f873212E6A7";

module.exports = treasuryExports({
  optimism: {
    tokens: [
      nullAddress,
      ADDRESSES.optimism.USDC, // USDC
      ADDRESSES.optimism.OP,
    ],
    owners: [treasury],
    ownTokens: [],
  },
});