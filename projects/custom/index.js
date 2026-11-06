const FACTORY = '0xf8651879d15ac3c3DAe12016Fbb604971F83b266'

async function tvl(api) {
  const count = Number(await api.call({ target: FACTORY, abi: 'uint256:launchCount' }))
  if (!Number.isSafeInteger(count) || count < 0) throw new Error('Invalid launch count')
  if (!count) return
  const launches = await api.multiCall({
    target: FACTORY,
    abi: 'function launches(uint256) view returns (address)',
    calls: Array.from({ length: count }, (_, i) => ({ params: [i] })),
  })
  if (!launches.length) return

  const phases = await api.multiCall({ abi: 'function phase() view returns (uint8)', calls: launches.map(target => ({ target })) })
  // Phase 1 still holds users' reserves while migration is pending.
  // Phase 2 liquidity belongs to Uniswap v4 and must not be counted here again.
  const active = launches.filter((_, i) => Number(phases[i]) < 2)
  if (!active.length) return
  const calls = active.map(target => ({ target }))
  const [quotes, reserves] = await Promise.all([
    api.multiCall({ abi: 'function quote() view returns (address)', calls }),
    api.multiCall({ abi: 'function quoteReserve() view returns (uint256)', calls }),
  ])
  quotes.forEach((quote, i) => api.add(quote, reserves[i]))
}

module.exports = {
  start: 1793930196,
  methodology: 'Counts actual quote-token reserves in Custom Launchpad bonding curves, including reserves pending migration. Excludes virtual reserves, unsold issued tokens, fee/dividend credits, treasury balances, bridged cETH supply, and liquidity held by Uniswap v4 after migration or in Custom/decreasing/cETH pools. No ETH price substitution is applied to cETH.',
  robinhood: { tvl },
}
