const { getCache } = require('../helper/http')
const url = 'https://api.realms.today/stats/tvl'

async function tvl() {
  const { tvl } = await getCache(url)
  return tvlObject(tvl)
}

async function staking() {
  const { ownTokens } = await getCache(url)
  return tvlObject(ownTokens)
}

function tvlObject(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([_, i]) => +i > 1).map(([a, b]) => ['solana:'+a, b]))
}

module.exports = {
  methodology: 'SOL token and stables held in the contracts are counted under tvl, gov tokens are counted under staking', 
  timetravel: false,
  solana: { tvl, staking,  }
}
