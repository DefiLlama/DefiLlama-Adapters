const { nullAddress, treasuryExports } = require("../helper/treasury");

const daoTreasury = "0x529C78Ee582e4293a20Ab60c848506eADd8723D8";
const ATF = "0x518b63Da813D46556FEa041A88b52e3CAa8C16a8";
const AGT = "0x0BF43350076F95e0d16120b4D6bdfA1C9D50BDBD";

module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress, ATF, AGT],
    owners: [daoTreasury],
    ownTokens: [ATF, AGT],
  },
});
