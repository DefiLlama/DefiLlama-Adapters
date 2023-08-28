const { treasuryExports } = require("../helper/treasury");

const Treasury = "0x7d9ff6cb1bc3491fed7bf279d8532cab594b29e8";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [],
    owners: [Treasury],
    ownTokens: ['0x5fd71280b6385157b291b9962f22153fc9e79000'],
  },
})