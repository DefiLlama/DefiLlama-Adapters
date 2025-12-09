const { aaveV3Export } = require("../helper/aave");

// https://aave.com/docs/resources/addresses
const CONFIG = {
  besc: ['0x3aDDb1f9F159326864B3d7046fB78150955e8587'],
};

module.exports = aaveV3Export(CONFIG)

module.exports.hallmarks = [
  [1761994532, "Start BESC Rewards on HyperLoan Protocol"],
]
