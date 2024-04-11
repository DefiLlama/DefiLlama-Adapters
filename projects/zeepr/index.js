const { staking } = require("../helper/staking");

module.exports = {
  arbitrum: {
    tvl: () => ({}),
    staking: staking("0xbb0390cf2586e9b0a4faadf720ae188d140e9fd5", "0xe46C5eA6Da584507eAF8dB2F3F57d7F578192e13"),
  },
  core: {
    tvl: () => ({}),
    staking: staking("0x60101E4388D1c2B389d78daC29d37Ee2DAc88e07", "0x1281E326C6e4413A98DafBd0D174a4Ae07ff4223"),
  },
}
