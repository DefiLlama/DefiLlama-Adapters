const { staking } = require('../helper/staking')

module.exports = {
  polygon: {
    tvl: () => ({}),
    staking: staking('0x2b9299f80a644CA60c0d398e257cb72488875d2A', '0x859a50979fdB2A2fD8Ba1AdCC66977C6f6b1CD5B')
  },
}