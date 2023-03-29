const { staking } = require("../helper/staking")

module.exports = {
  methodology: "TVL counts staked FUNB coins on the platform itself.",
  kava: {
    tvl: () => 0,
    staking: staking('0x1C4f227A2c7F62f88a7907cBF027403603A81A64', '0xD86c0B9b686f78a7A5C3780f03e700dbbAd40e01', undefined, 'bsc:0xD86c0B9b686f78a7A5C3780f03e700dbbAd40e01', 18),
  }
}
