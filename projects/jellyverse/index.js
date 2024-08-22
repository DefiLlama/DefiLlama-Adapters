const { cachedGraphQuery } = require('../helper/cache')

module.exports = {
  sei: {
    tvl,
  }
}

async function tvl(api) {
  let { tokens } = await cachedGraphQuery('jellyverse', 'https://graph.mainnet.jellyverse.org/subgraphs/name/jelly/verse', `{
  tokens {
    address
    symbol
    pool { id }
  }
}`)
  const vault = "0xFB43069f6d0473B85686a85F4Ce4Fc1FD8F00875"
  tokens = tokens.filter(t => !t.pool).map(t => t.address)
  return api.sumTokens({ owner: vault, tokens })
}
