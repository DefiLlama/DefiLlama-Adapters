const { getCache } = require('../helper/http')
const url = 'https://api.realms.today/stats/tvl'

async function tvl() {
  const { tvl } = await getCache(url)
  return Object.fromEntries(Object.entries(tvl).map(([a, b]) => ['solana:'+a, b]))
}

async function ownTokens() {
  const { ownTokens } = await getCache(url)
  return Object.fromEntries(Object.entries(ownTokens).map(([a, b]) => ['solana:'+a, b]))
}

module.exports = {
  timetravel: false,
  solana: { tvl, ownTokens,  }
}
