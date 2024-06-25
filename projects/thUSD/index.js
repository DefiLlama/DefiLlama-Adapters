const { getLiquityTvl } = require("../helper/liquity")

module.exports = {
  ethereum: {
    tvl: getLiquityTvl('0xf5e4ffeb7d2183b61753aa4074d72e51873c1d0a', { nonNativeCollateralToken: true, abis: { collateralToken: 'address:collateralAddress' } })
  }
}
