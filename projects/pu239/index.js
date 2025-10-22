const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  map: aaveExports(
    "map",
    "0x0fBB7d9866D357f75a8fAf83330b7d089703464e",
    undefined,
    ["0xa9fc4Ea8A1dE8C722D8a70a73f26E2DBD89475bd"],
    { v3: true }
  ),
};
