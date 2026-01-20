const { compoundExports2 } = require("../helper/compound");
const { stakingPriceLP } = require('../helper/staking')

module.exports = {
  arbitrum: compoundExports2({ comptroller: '0xf854c6b57e6d8ec3e790ec6da1a13060d19549d4', cether: '0x13f9a7f33550fe935bf7b544e536584d30ecf50a'}),
  core: compoundExports2({ comptroller: '0x6056Eb6a5634468647B8cB892d3DaA5F816939FC', cether: '0x03ef96f537a7cda4411c8643afd9d8814d5b4906'})
};

module.exports.core.staking = stakingPriceLP('0x959C7898318DC3c8fD11cbC5000f4e36F75144EC', '0x204e2D49b7cDA6d93301bcF667A2Da28Fb0e5780', '0xeaf1a065f85cf02547002d26aa42ee4516e21aa1')