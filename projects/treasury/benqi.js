const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x142eB2ed775e6d497aa8D03A2151D016bbfE7Fc2";
const qi = "0x8729438EB15e2C8B576fCc6AeCdA6A148776C0F5";

module.exports = treasuryExports({
  avax: {
    tokens: [nullAddress],
    owners: [treasury],
    ownTokens: [qi],
  },
});
