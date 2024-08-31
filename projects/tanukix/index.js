const { onChainTvl } = require('../helper/balancer')

module.exports = {
  methodology: "Sum of all the tokens locked in TanukiX vault",
  taiko: {
    tvl: onChainTvl('0x3251e99cEf4b9bA03a6434B767aa5Ad11ca6cc31', 204741)
  },
}