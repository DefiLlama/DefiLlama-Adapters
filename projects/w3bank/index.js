const { lendingMarket } = require("../helper/methodologies");
const { compoundExports2 } = require("../helper/compound");

module.exports = {
  start: 1693843200,
  pg: compoundExports2({ comptroller: '0x697bc9fd98ddafd1979c3e079033698ca93af451'}),
  methodology: `${lendingMarket}`,
};
