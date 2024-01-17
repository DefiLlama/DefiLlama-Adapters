const { usdCompoundExports } = require("../helper/compound");

const compoundData = usdCompoundExports(
  "0xe49627059Dd2A0fba4A81528207231C508d276CB",
  "canto"
);

module.exports = {
  canto: compoundData,
};
