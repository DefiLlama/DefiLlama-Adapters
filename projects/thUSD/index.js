const sdk = require('@defillama/sdk')
const { getLiquityTvl } = require("../helper/liquity")
const { sumTokensExport, nullAddress } = require("../helper/unwrapLPs")
const tBTCTvl = getLiquityTvl('0xf5e4ffeb7d2183b61753aa4074d72e51873c1d0a', { nonNativeCollateralToken: true, abis: { collateralToken: 'address:collateralAddress' } })
const ethTvl = sumTokensExport({ owners: ['0x1f490764473eb1013461D6079F827DB95d8B4DC5', '0xE922B5591Da479a559b25261BD6Dc8f89cA1A29d'], tokens: [nullAddress]})

module.exports = {
  ethereum: {
    tvl: sdk.util.sumChainTvls([tBTCTvl, ethTvl])
  }
}
