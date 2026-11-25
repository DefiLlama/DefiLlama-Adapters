const { get } = require("../helper/http")
const { getConfig } = require("../helper/cache")

const MIRROR = 'https://mainnet-public.mirrornode.hedera.com'
const CONTRACTS_API = 'https://locker.davincigraph.io/api/v3/contracts'
const SAUCERSWAP_POOLS = 'https://api.saucerswap.finance/pools/'

// Hedera ids (0.0.x) map to long-zero EVM addresses, which is how coreAssets/coins key HTS tokens
const toEvm = (id) => '0x' + BigInt(id.split('.')[2]).toString(16).padStart(40, '0')

async function getTokenBalances(accountId) {
  const balances = []
  let next = `/api/v1/accounts/${accountId}/tokens?limit=100`
  while (next) {
    const res = await get(MIRROR + next)
    res.tokens.forEach(({ token_id, balance }) => { if (+balance > 0) balances.push({ token_id, balance }) })
    next = res.links?.next
  }
  return balances
}

// SaucerSwap V1 LP tokens held by the Token Locker and Black Hole contracts, unwrapped into the
// pool's two tokens pro rata to lpTokenReserve (the LP token's total supply).
const tvl = async (api) => {
  const contracts = Object.values(await getConfig('davincigraph/contracts', CONTRACTS_API))
    .filter(({ type }) => type === 'LOCKER' || type === 'BLACKHOLE')
    .map(({ contractId }) => contractId)
  if (!contracts.length) throw new Error('davincigraph: no locker contracts returned')

  const pools = {}
  for (const pool of await get(SAUCERSWAP_POOLS)) pools[pool.lpToken.id] = pool

  for (const contract of contracts) {
    for (const { token_id, balance } of await getTokenBalances(contract)) {
      const pool = pools[token_id]
      if (!pool || !+pool.lpTokenReserve) continue
      const share = BigInt(balance)
      const supply = BigInt(pool.lpTokenReserve)
      api.add(toEvm(pool.tokenA.id), (BigInt(pool.tokenReserveA) * share / supply).toString())
      api.add(toEvm(pool.tokenB.id), (BigInt(pool.tokenReserveB) * share / supply).toString())
    }
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology: "Liquidity locked in the davincigraph Token Locker and burned through its Black Hole contracts: SaucerSwap V1 LP tokens held by those contracts, unwrapped into the pool's underlying tokens. Contracts are listed at https://davincigraph.io/locks/contracts and /burns/contracts.",
  hedera: { tvl }
};
