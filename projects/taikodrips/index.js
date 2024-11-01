const ADDRESSES = require('../helper/coreAssets.json')
const { staking } = require("../helper/staking")

const TaikoToken = ADDRESSES.taiko.TAIKO
const FarmingContract = '0xf90209C44dBf5Fa3d40ac85a008206b5A8c24899'

module.exports = {
  methodology: 'We count the TVL on the Taiko token in the farming contract.',
  taiko: {
    tvl: () => ({}),
    staking: staking([FarmingContract], TaikoToken)
  }
}
