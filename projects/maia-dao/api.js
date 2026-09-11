const { staking } = require('../helper/staking')

module.exports = {
  metis: {
    tvl: () => ({}),
    staking: () => ({}),
  },
  arbitrum: {
    staking: staking('0x000000f0C01c6200354f240000b7003668B4D080', '0x00000000ea00F3F4000e7Ed5Ed91965b19f1009B'), // v2
  },
  "hallmarks": [
    [
      "2024-08-20",
      "V2 Launch"
    ],
    [
      "2024-09-24",
      "Whitehack by team"
    ]
  ]
}