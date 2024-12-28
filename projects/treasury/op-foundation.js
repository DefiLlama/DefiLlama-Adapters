const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x2501c477d0a35545a387aa4a3eee4292a9a8b3f0";
const treasury2 = "0xfedfaf1a10335448b7fa0268f56d2b44dbd357de";
const treasury3 = "0x2a82ae142b2e62cb7d10b55e323acb1cab663a26";
const treasury4 = "0x19793c7824be70ec58bb673ca42d2779d12581be";

const OP = ADDRESSES.optimism.OP

module.exports = treasuryExports({
  optimism: {
    tokens: [ 
        nullAddress,
        ADDRESSES.optimism.USDC
     ],
    owners: [treasury,treasury2,treasury3,treasury4],
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