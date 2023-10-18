const { compoundExports2 } = require("../helper/compound");
const { staking } = require('../helper/staking')
const { pool2 } = require('../helper/pool2')

module.exports = {
  base: compoundExports2({
    comptroller: "0x9C1925d9fA1E9ba7aa57db36B15E29C07f5d85e2",
    fetchBalances: true,
    cether: '0x68725461357B7e5e059A224B3b2fC45F3654c889',
  }),
};

module.exports.base.staking = staking('0xaa8578b6F2860EbA5685090A3E002430ba046a4C', '0x2DC1cDa9186a4993bD36dE60D08787c0C382BEAD', 'base')
module.exports.base.pool2 = pool2('0x3B87B63b5E84e6F9A173D15ad4cdB3263B550064', '0xC2dced7Ce908652d3b55D55555DcE96b6cdCB191', 'base')
