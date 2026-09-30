const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// Kaleido swap: Uniswap-V3-style pools created by Kaleido's own factory on Arc.
const FACTORY = '0xbB74f2319494461B2591F8fbF126654Dd4c2a649'

// The pools' quote asset is a WETH9 deployed on Arc that wraps native USDC 1:1 (18 decimals). It has no price
// of its own, so its balance is counted as USDC (6 decimals) below.
const WRAPPED_NATIVE = '0x8c6c0A4C5500c2bC196383B4D85feb7f08a5C75b'

// Tokens Kaleido's pools are made of, and the factory's fee tiers. Pools are looked up with getPool for every
// pair of these, which is one batched call and does not depend on scanning event logs.
const TOKENS = [WRAPPED_NATIVE, ADDRESSES.arc.USDC, ADDRESSES.arc.EURC, ADDRESSES.arc.cirBTC]
const FEES = [100, 500, 3000, 10000]
const ZERO = '0x0000000000000000000000000000000000000000'

async function tvl(api) {
  const calls = []
  for (let i = 0; i < TOKENS.length; i++)
    for (let j = i + 1; j < TOKENS.length; j++)
      for (const fee of FEES) calls.push({ params: [TOKENS[i], TOKENS[j], fee], pair: [TOKENS[i], TOKENS[j]] })

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
    delete balances[key]
    api.removeTokenBalance(WRAPPED_NATIVE)
    api.add(ADDRESSES.arc.USDC, raw / 10n ** 12n)
  }
  return api.getBalances()
}

module.exports = {
  methodology: 'TVL is the token balances held by the pools created by the Kaleido V3 factory on Arc.',
  start: 1789855914, // 2026-09-19
  arc: { tvl },
}
