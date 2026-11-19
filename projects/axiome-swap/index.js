const { queryContracts, queryManyContracts } = require('../helper/chain/cosmos')
const { transformDexBalances } = require('../helper/portedTokens')

// Axiome Swap is a wasmswap (Junoswap-style) AMM on the Axiome chain.
// All liquidity pools share the same contract code (code id 2), so we enumerate
// every pool by code id and read each pool's reserves via the `info` query.
// Reserves are passed through transformDexBalances so that unknown tokens are
// priced off the known token they are paired against (e.g. AXM), and LP token
// supply is not double-counted.
const POOL_CODE_ID = 2

function getToken(denom) {
  // denom is either { native: "uaxm" } or { cw20: "axm1..." }
  return denom.native || denom.cw20
}

async function tvl(api) {
  const pools = await queryContracts({ chain: api.chain, codeId: POOL_CODE_ID })
  const infos = await queryManyContracts({ chain: api.chain, contracts: pools, data: { info: {} } })
  const data = infos.filter(Boolean).map(info => ({
    token0: getToken(info.token1_denom),
    token0Bal: info.token1_reserve,
    token1: getToken(info.token2_denom),
    token1Bal: info.token2_reserve,
  }))
  return transformDexBalances({ api, data })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: true,
  methodology: 'Counts the token reserves held in all Axiome Swap liquidity pools (wasmswap contracts sharing code id 2), summing both sides of each pool.',
  axiome: { tvl },
}
