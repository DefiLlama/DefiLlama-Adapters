const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  onus: {
    tvl: getUniTVL({  factory: '0x6CD368495D90b9Ba81660e2b35f7Ea2AcE2B8cD6', useDefaultCoreAssets: true }),
  }
}