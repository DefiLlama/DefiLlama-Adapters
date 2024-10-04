const { aaveExports } = require("../helper/aave");

module.exports = {
  deadFrom: '2023-11-23',
  polygon_zkevm: aaveExports("polygon_zkevm", undefined, undefined, [
    "0x27268393Fb8CD0556A62C749C9E70aA537910acc",
  ]),
};

module.exports.polygon_zkevm.borrowed = () => ({}) // bad debt
