const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x2501c477d0a35545a387aa4a3eee4292a9a8b3f0";
const OP = ADDRESSES.optimism.OP

module.exports = treasuryExports({
  optimism: {
    tokens: [ 
        nullAddress,
        ADDRESSES.optimism.USDC
     ],
    owners: [treasury],
    ownTokens: [OP],
  },
  ethereum: {
    tokens: [ 
        nullAddress,
     ],
    owners: [treasury],
    ownTokens: [],
  },
})