module.exports = {
    methodology: "USDT in orderbook",
  }
  
  const config = {
    mode: ['0xd754701052c09b7985284b3111f3228ace3c0260', '0xb07b306664e9f053c5096295f193f9deba961449', '0x2909b13261261ecbf71decb2a25c6ff1a4147794']
  }
  
  Object.keys(config).forEach(chain => {
    let vault = config[chain]
    module.exports[chain] = {
      tvl: async (_, _b, _cb, { api, }) => {
        if (!Array.isArray(vault)) vault = [vault]
        const ownerTokens = []
        for (const v of vault) {
          const tokens = await api.fetchList({ lengthAbi: 'allWhitelistedTokensLength', itemAbi: 'allWhitelistedTokens', target: v })
          ownerTokens.push([tokens, v])
        }
        return api.sumTokens({ ownerTokens })
      }
    }
  })