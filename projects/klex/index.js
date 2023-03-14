const { onChainTvl } = require("../helper/balancer");

module.exports = {
  klaytn:{
    tvl: onChainTvl('0xb519Cf56C63F013B0320E89e1004A8DE8139dA27', 99368355)
  },
}