const { get } = require('../helper/http')
const { sumTokens2 } = require('../helper/unwrapLPs')

async function tvl(api) {
  let key = ''
  const pools = []
  do {
    const { pagination: { next_key }, pool } = await get('https://api.elys.network/elys-network/elys/amm/pool/1?pagination.count_total=true&pagination.per_page=1000&pagination.key=' + key)
    key = next_key
    pools.push(...pool)
  } while (key)
  pools.forEach(pool => {
    pool.pool_assets.forEach(({ token: { denom, amount } }) => api.add(denom, amount))
  })

  return sumTokens2({ api })
}


module.exports = {
  elys: { tvl, }
}