const { treasuryExports } = require("../helper/treasury");

const arbtreasury = "0xDD125048F4A045582dA6c2768ca9D70F3259470C";
const ethtreasury = "0xff830ce17D39BbD6a4fef9683308D793dF8E34fC";
const HFTtoken = "0xb3999F658C0391d94A37f7FF328F3feC942BcADC"

module.exports = treasuryExports({
  arbitrum: {
    owners: [arbtreasury],
  },
  ethereum: {
    owners: [ethtreasury],
    ownTokens: [HFTtoken]
  }
})