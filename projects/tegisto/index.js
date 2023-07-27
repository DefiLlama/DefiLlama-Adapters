const { staking } = require("../helper/staking")
const { getUniTVL } = require("../helper/unknownTokens")

module.exports = {
  kava: {
    tvl: getUniTVL({ chain: 'kava', factory: '0xfdF832fe60a5145909e7b24Cff225830c1850917', useDefaultCoreAssets: true, fetchBalances: true }), 
    staking: staking('0x744Dd9f79b80437a9e5eb0292128045F51C48b6d', '0x87F1E00d6bcD3712031e5edD26DFcdB0FEd35D20', undefined, 'tegisto', 18),
  },
  celo: {
    tvl: getUniTVL({ chain: 'celo', factory: '0x1FA136Ba715889B691305a687A0fbD82e6287A67', useDefaultCoreAssets: true, fetchBalances: true }),
  }
}