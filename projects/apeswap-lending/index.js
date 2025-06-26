const { compoundExports2 } = require('../helper/compound')
const methodologies = require('../helper/methodologies')

module.exports = {
  bsc: compoundExports2({ comptroller: '0xad48b2c9dc6709a560018c678e918253a65df86e' }),
  methodology: methodologies.lendingMarket,
}