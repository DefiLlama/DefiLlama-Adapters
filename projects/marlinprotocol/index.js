const { staking } = require('../helper/staking');

module.exports = {
  arbitrum: {
    tvl: () => ({}),
    staking: staking(
      "0xf90490186F370f324DEF2871F077668455f65253",
      "0xdA0a57B710768ae17941a9Fa33f8B720c8bD9ddD"
    )
  },
};