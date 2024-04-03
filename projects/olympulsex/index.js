const { sumTokensExport } = require('../helper/unknownTokens')

const stakingToken = "0xBB366A397D7d4d2BEDABD9139D4c32a8826605Ed"; // SEX
const staking = "0xf1Bc988e7EaBA7a2dbF0121E6ad9BEA82A1AB1ff";
const LP = '0x2d593b3472d6a5439bC1523a04C2aec314CBc44c'

module.exports = {
  pulse: {
    tvl: () => 0,
    staking: sumTokensExport({ owner: staking, tokens: [stakingToken], lps: [LP], useDefaultCoreAssets: true, }),
  }
}