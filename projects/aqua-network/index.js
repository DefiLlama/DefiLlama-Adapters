const { callSoroban } = require('../helper/chain/stellar')

// Aqua Soroban AMM LiquidityPoolRouter contract. Retrieves all pools via the
// router's get_tokens_sets_count + get_pools_for_tokens_range, then reads each
// pool's get_reserves: https://github.com/AquaToken/soroban-amm
const ROUTER = 'CBQDHNBFBZYE4MKPWBSJOPIYLW4SFSXAXUTSXJN76GNKYVYPCKWC6QUK'

const TOKEN_SETS_PAGE = 25n

async function tvl(api) {
  const totalSets = await callSoroban(ROUTER, 'get_tokens_sets_count')

  for (let start = 0n; start < totalSets; start += TOKEN_SETS_PAGE) {
    const end = start + TOKEN_SETS_PAGE > totalSets ? totalSets : start + TOKEN_SETS_PAGE
    const batch = await callSoroban(ROUTER, 'get_pools_for_tokens_range', [
      { type: 'u128', value: start },
      { type: 'u128', value: end },
    ])
    for (const [tokens, poolsMap] of batch) {
      for (const poolAddr of Object.values(poolsMap)) {
        const reserves = await callSoroban(poolAddr, 'get_reserves')
        if (!reserves) continue
        for (let j = 0; j < tokens.length; j++) {
          if (reserves[j] && reserves[j] > 0n) api.add(tokens[j], reserves[j].toString())
        }
      }
    }
  }
}

module.exports = {
  timetravel: false,
  methodology:
    'Counts liquidity locked in all Aqua AMM pools. Enumerates the full pool list on-chain via the LiquidityPoolRouter (get_tokens_sets_count + get_pools_for_tokens_range), then reads each pool contract\'s get_reserves directly.',
  stellar: { tvl },
}
