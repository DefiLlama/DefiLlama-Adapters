const { treasuryExports } = require("../helper/treasury");
const {nullAddress} = require('../helper/tokenMapping');

module.exports = treasuryExports({
  proptech: {
    owners: ["0x243AC97f37040A7f64a11B84c818cE222A8d3ab7"],
    ownTokens: [nullAddress],
  },
});