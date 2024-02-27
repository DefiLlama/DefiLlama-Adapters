const { getUniTVL } = require('../helper/unknownTokens')

module.exports = {
  misrepresentedTokens: true,
  linea: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0xfF5859B60BCb3F153431cA216B1b269EB66A2020',
    })
  },
  base: {
    tvl: getUniTVL({
      useDefaultCoreAssets: true,
      factory: '0x4858C605862A91A34d83C19a9704f837f64fa405',
    })
  }
}