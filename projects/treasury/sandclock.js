const ADDRESSES = require('../helper/coreAssets.json');
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x035F210e5d14054E8AE5A6CFA76d643aA200D56E";

module.exports = treasuryExports({
  ethereum: {
    tokens: [
        nullAddress,
        ADDRESSES.ethereum.USDC,
        ADDRESSES.ethereum.DAI,
        ADDRESSES.ethereum.USDT,
        ADDRESSES.ethereum.LUSD,
     ],
    owners: [treasury],
    ownTokens: ["0xba8a621b4a54e61c442f5ec623687e2a942225ef"],
  },
})
