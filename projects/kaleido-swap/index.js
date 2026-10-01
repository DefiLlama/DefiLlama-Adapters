const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Kaleido swap: Uniswap-V3-style pools created by Kaleido's own factory on Arc.
const FACTORY = '0xbB74f2319494461B2591F8fbF126654Dd4c2a649'
const LENDING = '0xE4e7f16DB22e6bb2E505fbC504d7B2B4B995A6E3' // Kaleido lending market; its registered tokens are the ones Kaleido pools are made of

// The pools' quote asset is a WETH9 deployed on Arc that wraps native USDC 1:1 (18 decimals). It has no price
// of its own, so its balance is counted as native USDC below.
const WRAPPED_NATIVE = '0x8c6c0A4C5500c2bC196383B4D85feb7f08a5C75b'

const FEES = [100, 500, 3000, 10000]
const ZERO = '0x0000000000000000000000000000000000000000'
const SENTINEL = '0x0000000000000000000000000000000000000001'

// Pools are found with the factory's getPool for every pair of known Arc tokens (DefiLlama's Arc core assets plus
// every token the Kaleido lending market has registered), in one batched call. Event logs are not used: Arc's public
// RPCs rate-limit or prune getLogs over long ranges.
async function tokenSet(api) {
  const [collateral, loanable] = await Promise.all([
    api.call({ target: LENDING, abi: 'function getAllCollateralToken() view returns (address[])' }),
    api.call({ target: LENDING, abi: 'function getLoanableAssets() view returns (address[])' }),
  ])
  const all = [WRAPPED_NATIVE, ...Object.values(ADDRESSES.arc), ...collateral, ...loanable]
    .map(t => t.toLowerCase())
    .filter(t => t !== SENTINEL && t !== ZERO)
  return [...new Set(all)]
}

async function tvl(api) {
  const tokens = await tokenSet(api)
  const calls = []
  for (let i = 0; i < tokens.length; i++)
    for (let j = i + 1; j < tokens.length; j++)
      for (const fee of FEES) calls.push({ params: [tokens[i], tokens[j], fee], pair: [tokens[i], tokens[j]] })

  const found = await api.multiCall({
    abi: 'function getPool(address,address,uint24) view returns (address)',
    target: FACTORY,
    calls: calls.map(c => ({ params: c.params })),
  })
  const ownerTokens = []
  found.forEach((pool, i) => {
    if (pool && pool.toLowerCase() !== ZERO) ownerTokens.push([calls[i].pair, pool])
  })

  const balances = await sumTokens2({ api, ownerTokens, resolveLP: false })

  const key = Object.keys(balances).find(k => k.toLowerCase() === `arc:${WRAPPED_NATIVE.toLowerCase()}`)
  if (key) {
    const raw = BigInt(balances[key].toString())
    api.removeTokenBalance(WRAPPED_NATIVE)
    api.add(ADDRESSES.null, raw)
  }
  return api.getBalances()
}

module.exports = {
  methodology: 'TVL is the token balances held by the pools created by the Kaleido V3 factory on Arc.',
  start: '2026-09-29',
  arc: { tvl },
}
