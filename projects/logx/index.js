const { nullAddress } = require("../helper/tokenMapping")

module.exports = {
  methodology: "USDC.e in the vault",
  hallmarks: [
    ['2024-09-10', 'v1 is deprecated'],
  ],
}

const config = {
  linea: '0xc5f444d25d5013c395f70398350d2969ef0f6aa0',
  mantle: '0x7A74Dd56Ba2FB26101A7f2bC9b167A93bA5e1353',
  kroma: '0xC5f444D25D5013C395F70398350d2969eF0F6AA0',
  manta: '0x53c6decad02cB6C535a7078B686650c951aD6Af5',
  telos: '0x082321F9939373b02Ad54ea214BF6e822531e679',
  fuse: '0x082321F9939373b02Ad54ea214BF6e822531e679',
  mode: ['0x34b83A3759ba4c9F99c339604181bf6bBdED4C79', '0x082321F9939373b02Ad54ea214BF6e822531e679'],
  zklink: ['0x75940cDa18F14D1F97562fc2A6dBCe31CBe03870']
}

Object.keys(config).forEach(chain => {
  let vault = config[chain]
  module.exports[chain] = {
    tvl: async (api) => {
      if (!Array.isArray(vault)) vault = [vault]
      const ownerTokens = []
      for (const v of vault) {
        const tokens = await api.fetchList({ lengthAbi: 'allWhitelistedTokensLength', itemAbi: 'allWhitelistedTokens', target: v })
        ownerTokens.push([tokens.map(i => {
          switch (i.toLowerCase()) {
            case '0x000000000000000000000000000000000000800a': return nullAddress
            default: return i
          }
        }), v])
      }
      return api.sumTokens({ ownerTokens })
    }
  }
})