const { staking } = require('../helper/staking')

module.exports = {
  cronos: {
    tvl: () => ({}),
    staking: staking('0x692db42F84bb6cE6A6eA62495c804C71aA6887A7', '0x50c0c5bda591bc7e89a342a3ed672fb59b3c46a7')
  },
}