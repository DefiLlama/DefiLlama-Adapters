const { aaveExports } = require("../helper/aave");
const methodologies = require("../helper/methodologies");

module.exports = {
  methodology: methodologies.lendingMarket,
  sty: aaveExports('sty', '0xe80c9a1D69cd3EE13A65BFA84C6Bb4Af7130D3a1'),
}
