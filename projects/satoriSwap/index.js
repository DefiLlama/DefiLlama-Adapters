const { getUniTVL } = require('../helper/unknownTokens')

const config = {
  base: '0x4858C605862A91A34d83C19a9704f837f64fa405',
  linea: '0xfF5859B60BCb3F153431cA216B1b269EB66A2020',
  xlayer: '0xd967A2A9B873ccD5a5Ede00869e353949F24c3dc',
}

module.exports = {
  misrepresentedTokens: true,
}

Object.keys(config).forEach(chain => {
  module.exports[chain] = {
    tvl: getUniTVL({ factory: config[chain], useDefaultCoreAssets: true }),
  }
})