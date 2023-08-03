const { tvl, borrowed } = require("./helper/index.js");

module.exports = {
    timetravel: true,
    methodology: `Counts the tokens locked in the contracts to be used as collateral to borrow or to earn yield. Borrowed coins are not counted towards the TVL`,
    ethereum: {
      tvl,
      borrowed,
    },
};