const { sumTokens, sumCW20Tokens, queryContract } = require('../helper/chain/cosmos')
const { getUniqueAddresses } = require('../helper/utils')

const AMM_V3_CONTRACT = "orai10s0c75gw5y5eftms5ncfknw6lzmx0dyhedn75uz793m8zwz4g8zq4d9x9a"

const isNativeToken = denom => !denom.startsWith("orai1")

async function tvl(api) {
  const CHUNK_SIZE = 100
  const pools = []
  let hasMore = true

  while (hasMore) {
    const startAfter = pools.length == 0 ? undefined : pools[pools.length - 1].pool_key
    const res = await queryContract({
      chain: api.chain,
      contract: AMM_V3_CONTRACT,
      data: { pools: { limit: CHUNK_SIZE, startAfter } }
    })

    pools.push(...res)
    hasMore = res.length === CHUNK_SIZE
  }

  let cw20Tokens = pools.map(pool => [pool.pool_key.token_x, pool.pool_key.token_y]).flat().filter(token => !isNativeToken(token))
  cw20Tokens = getUniqueAddresses(cw20Tokens, true)

  await sumTokens({ owner: AMM_V3_CONTRACT, api, })
  return sumCW20Tokens({ api, tokens: cw20Tokens, owner: AMM_V3_CONTRACT })
}

module.exports = {
  timetravel: false,
  methodology: "Liquidity on pool V3",
  orai: { tvl }
}