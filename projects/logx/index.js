module.exports = {
  methodology: "USDC.e in the vault",
}

const config = {
  linea: '0xc5f444d25d5013c395f70398350d2969ef0f6aa0',
  mantle: '0x7A74Dd56Ba2FB26101A7f2bC9b167A93bA5e1353',
  kroma: '0xC5f444D25D5013C395F70398350d2969eF0F6AA0',
}

Object.keys(config).forEach(chain => {
  const vault = config[chain]
  module.exports[chain] = {
    tvl: async (_, _b, _cb, { api, }) => {
      const tokens = await api.fetchList({ lengthAbi: 'allWhitelistedTokensLength', itemAbi: 'allWhitelistedTokens', target: vault })
      return api.sumTokens({ owner: vault, tokens })
    }
  }
})