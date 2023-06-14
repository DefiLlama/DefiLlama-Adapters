const { staking } = require("../helper/staking")
const { getUniTVL } = require("../helper/unknownTokens")

module.exports = {
  kava: {
    tvl: getUniTVL({ chain: 'kava', factory: '0x07fA706528c0bb721327798B5686B620BCcf5b99', useDefaultCoreAssets: true, fetchBalances: true }), 
    staking: staking('0x744Dd9f79b80437a9e5eb0292128045F51C48b6d', '0x87F1E00d6bcD3712031e5edD26DFcdB0FEd35D20', undefined, 'tegisto', 18),
  }
}