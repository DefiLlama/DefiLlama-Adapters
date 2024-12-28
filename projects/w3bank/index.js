const { lendingMarket } = require("../helper/methodologies");
const { compoundExports2 } = require("../helper/compound");

module.exports = {
  start: '2023-09-04',
  pg: compoundExports2({ comptroller: '0x697bc9fd98ddafd1979c3e079033698ca93af451'}),
  methodology: `${lendingMarket}`,
};

module.exports.deadFrom='2024-06-21',
module.exports.pg.borrowed = () => ({}) // bad debt
