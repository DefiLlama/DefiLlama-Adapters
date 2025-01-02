const { staking } = require('./helper/staking')
const TimeStaking = "0x85784d5e2CCae89Bcb39EbF0ac6Cdc93d42d99AD"
const time = "0x7d1232b90d3f809a54eeaeebc639c62df8a8942f"

module.exports = {
  avax:{
    tvl: () => ({}),
    staking: staking(TimeStaking, time)
  },
  methodology:
    "Counts tokens on the treasury for tvl and staked SB for staking",
};
