const { nullAddress, treasuryExports } = require("../helper/treasury");

module.exports = treasuryExports({
  arbitrum: {
    owners: ['0x2f60c9cee6450a8090e17a79e3dd2615a1c419eb',],
    tokens: [
      nullAddress,
    ],
  },
});