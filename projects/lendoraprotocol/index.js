const { compoundExports2 } = require("../helper/compound");
const { staking } = require('../helper/staking')

module.exports = {
  scroll: compoundExports2({
    comptroller: '0xA27CDE1F3dcaaF653624049Fc3b1a720eC1D4e91',
    cether: '0xBC7fA7C2dF265d073Be6D1c88468AEB5c06ba07c',
  }),
};


module.exports.deadFrom = '2023-12-04',

module.exports.scroll.staking = staking(
  ['0xca4fb5541D0f2899549e5f454155E1B34acc9379', '0x578E4f84663260e5C5c64d5310Dd76aA3CEC633c'],
  '0x3e6c99915803631D200441CdF6D84786912b0871',
  'scroll'
)

module.exports.scroll.borrowed = () => ({}) // bad debt
