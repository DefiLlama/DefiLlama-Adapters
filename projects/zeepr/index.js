const { staking } = require("../helper/staking");

module.exports = {
  arbitrum: {
    tvl: () => ({}),
    staking: staking("0xbb0390cf2586e9b0a4faadf720ae188d140e9fd5", "0xe46C5eA6Da584507eAF8dB2F3F57d7F578192e13"),
  },
  core: {
    tvl: () => ({}),
    staking: staking("0x60101E4388D1c2B389d78daC29d37Ee2DAc88e07", ["0x1281E326C6e4413A98DafBd0D174a4Ae07ff4223","0x40375C92d9FAf44d2f9db9Bd9ba41a3317a2404f"]),
  },
  bsc: {
    tvl: () => ({}),
    staking: staking("0x096e9A8B7137bEBA3A043b800D3d227d5abB077a", "0x55CBAC75C1af769eB7FD37d27A5cb6437EB29abB"),
  },
  manta: {
    tvl: () => ({}),
    staking: staking("0x37D8A51d9621041d6b9276ea8a835553b31698c7", "0x0863C7BcdB6Cf6edd5dc4bbd181A8D555AedbfBd"),
  },
  polygon: {
    tvl: () => ({}),
    staking: staking("0xCb9A02B704640ffcf43D6a8DAe5096fc8a44021c", "0x49fdEA2192b04e54E6D1cB5E3B3b996BAA6f621F"),
  },
  zkfair: {
    tvl: () => ({}),
    staking: staking("0x37D8A51d9621041d6b9276ea8a835553b31698c7", "0x5d26DeA980716e4aBa19F5B73Eb3DCcE1889F042"),
  },
}
