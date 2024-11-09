const {compoundExports2} = require('../helper/compound');
const methodologies = require('../helper/methodologies');

const unitroller_bsc = "0x4f92913b86d5e79593fa2e475a8232b22ef17ed1"

module.exports = {
  bsc:compoundExports2({ comptroller: unitroller_bsc}),
  methodology: methodologies.lendingMarket,
}