const ADDRESSES = require('../helper/coreAssets.json')
const { nullAddress, treasuryExports } = require("../helper/treasury");

const treasury = "0x6508ef65b0bd57eabd0f1d52685a70433b2d290b";
const communityFund = "0xe3997288987e6297ad550a69b31439504f513267";

module.exports = treasuryExports({
  ethereum: {
    owners: [treasury, communityFund],
    ownTokens: [ADDRESSES.ethereum.CRV],
    tokens: [
      nullAddress,
      ADDRESSES.ethereum.CRVUSD,
    ],
  }
});