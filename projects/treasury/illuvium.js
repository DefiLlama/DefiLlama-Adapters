const { treasuryExports } = require("../helper/treasury");

const Treasury = "0x58c37a622cdf8ace54d8b25c58223f61d0d738aa";

module.exports = treasuryExports({
  arbitrum: {
    tokens: [],
    owners: [Treasury],
    ownTokens: ['0x767FE9EDC9E0dF98E07454847909b5E959D7ca0E'],
  },
})