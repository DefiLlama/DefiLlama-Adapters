const { staking } = require("../helper/staking")

const TaikoToken = "0xA9d23408b9bA935c230493c40C73824Df71A0975"
const FarmingContract = '0xf90209C44dBf5Fa3d40ac85a008206b5A8c24899'

module.exports = {
  methodology: 'We count the TVL on the Taiko token in the farming contract.',
  taiko: {
    tvl: () => ({}),
    staking: staking([FarmingContract], TaikoToken)
  }
}
