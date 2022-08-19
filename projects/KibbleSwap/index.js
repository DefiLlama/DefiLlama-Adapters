const { getUniTVL, staking, } = require('../helper/unknownTokens')

const chain = 'dogechain'
const KIB = '0x1e1026ba0810e6391b0F86AFa8A9305c12713B66'
const coreAssets = ['0xB7ddC6414bf4F5515b52D8BdD69973Ae205ff101']
const lps = ['0x1709b8076F9ecb6b30567A6980754A9E5c33F837']


module.exports = {
  misrepresentedTokens: true,
  dogechain: {
    tvl: getUniTVL({
      chain, coreAssets,
      factory: '0xF4bc79D32A7dEfd87c8A9C100FD83206bbF19Af5',
    }),
    staking: staking({
      chain, coreAssets,
      owner: '0x8ffBD442F246964A0d2E87C9b2551095bdA6EEb3',
      tokens: [KIB],
      lps,
     })
  }
}
