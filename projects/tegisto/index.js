const { staking } = require("../helper/staking")
const { getUniTVL } = require("../helper/unknownTokens")
const sdk = require('@defillama/sdk')

const blacklistedTokens = ['0xbd10f04b8b5027761fcaad42421ad5d0787211ee']
module.exports = {
  kava: {
    tvl: sdk.util.sumChainTvls([
      getUniTVL({ factory: '0x07fA706528c0bb721327798B5686B620BCcf5b99', useDefaultCoreAssets: true, blacklistedTokens, }),
      getUniTVL({ factory: '0xfdF832fe60a5145909e7b24Cff225830c1850917', useDefaultCoreAssets: true, blacklistedTokens, }),
    ]), 
    staking: staking('0x744Dd9f79b80437a9e5eb0292128045F51C48b6d', '0x87F1E00d6bcD3712031e5edD26DFcdB0FEd35D20', undefined, 'tegisto', 18),
  },
  celo: {
    tvl: getUniTVL({ factory: '0x1FA136Ba715889B691305a687A0fbD82e6287A67', useDefaultCoreAssets: true, }),
  }
}