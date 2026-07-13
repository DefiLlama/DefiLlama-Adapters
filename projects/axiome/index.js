const { get } = require('../helper/http')

async function tvl() {
  const pairs = await get('https://api-idx.axiomechain.org/swap/pairs')

  let axmReserves = 0
  for (const pair of pairs) {
    if (pair.token1.symbol === 'AXM') axmReserves += Number(pair.token1.reserve)
    if (pair.token2.symbol === 'AXM') axmReserves += Number(pair.token2.reserve)
  }

  return { 'axiome': (axmReserves * 2) / 1e6 }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL equals liquidity locked in AxiomeTrade DEX pools on Axiome chain. Calculated as 2x the AXM-side reserves of all 35 pools, queried from the chain indexer.',
  axiome: { tvl },
}
