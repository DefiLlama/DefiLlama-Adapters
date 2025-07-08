const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x1046BE559A736dca32C55026165902916e406343";
const R = "0x183015a9bA6fF60230fdEaDc3F43b3D788b13e21";
const RAFT = "0x4C5Cb5D87709387f8821709f7a6664f00DcF0C93";

module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress, R],
    owners: [treasury],
    ownTokens: [RAFT],
  },
});
