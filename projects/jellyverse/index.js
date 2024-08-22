const { cachedGraphQuery } = require('../helper/cache')

module.exports = {
  sei: {
    tvl,
  }
}

async function tvl(api) {
  let { balancers } = await cachedGraphQuery('jellyverse', 'https://graph.mainnet.jellyverse.org/subgraphs/name/jelly/verse', `{
  balancers {
    pools {
      address
      tokens {
        symbol
        address
      }
    }
  }
}`)
  const vault = "0xFB43069f6d0473B85686a85F4Ce4Fc1FD8F00875"
  const blacklistedTokens = []
  const tokens = balancers.map(i => {
    blacklistedTokens.push(...i.pools.map(j => j.address))
    return i.pools.map(j => {
      return j.tokens.map(k => k.address)
    }).flat()
  }).flat()
  return api.sumTokens({ owner: vault, tokens, blacklistedTokens, })
}
