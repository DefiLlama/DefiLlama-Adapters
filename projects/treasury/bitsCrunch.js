const { nullAddress, treasuryExports } = require("../helper/treasury");

const bitsCrunchTreasury = "0xf42c74D82a42a7BEC7565c5a866Baca11260F0AF";

const BCUT = "0xBEF26Bd568e421D6708CCA55Ad6e35f8bfA0C406";

module.exports = treasuryExports({
  ethereum: {
    tokens: [nullAddress],
    owners: [bitsCrunchTreasury],
    ownTokens: [BCUT],
  },
});
