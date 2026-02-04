const { cachedGraphQuery } = require('../helper/cache')

module.exports = {
  sei: {
    tvl,
  }
}

async function tvl(api) {
  let tokens = await cachedGraphQuery('jellyverse', 'https://graph.jellyverse.org', `query q($lastId: ID){
  tokens (where: {id_gt: $lastId} first: 1000) {
  id
    address
    pool { id }
  }
}`, { fetchById: true })
  const vault = "0xFB43069f6d0473B85686a85F4Ce4Fc1FD8F00875"
  tokens = tokens.filter(t => !t.pool).map(t => t.address)
  return api.sumTokens({ owner: vault, tokens })
}
