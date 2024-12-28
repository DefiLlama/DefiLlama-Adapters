const { getUniTVL, staking, } = require('../helper/unknownTokens')

const chain = 'dogechain'
const KIB = '0x1e1026ba0810e6391b0F86AFa8A9305c12713B66'
const lps = ['0xC1C10b8BeeC82E840990A2c60A54ccdB39b2153F']


module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain, useDefaultCoreAssets: true,
      factory: '0xF4bc79D32A7dEfd87c8A9C100FD83206bbF19Af5',
    }),
    staking: staking({
      chain, useDefaultCoreAssets: true,
      owner: '0x8ffBD442F246964A0d2E87C9b2551095bdA6EEb3',
      tokens: [KIB],
      lps,
     })
  }
}
