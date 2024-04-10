const { staking } = require("../helper/staking");

module.exports = {
  arbitrum: {
    tvl: () => ({}),
    staking: staking("0xbb0390cf2586e9b0a4faadf720ae188d140e9fd5", "0xe46C5eA6Da584507eAF8dB2F3F57d7F578192e13"),
  },
}
