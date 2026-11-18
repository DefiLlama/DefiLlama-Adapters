const sdk = require('@defillama/sdk')
const { get } = require('../helper/http')

// Discovery only: Kasseal's indexer lists the live bonding-curve covenant cells (Kaspa L1) with their addresses
// (API docs: https://api.kasseal.com/v1/openapi.yaml, GET /metrics/cells). The KAS in each cell is measured on chain
// through api.kaspa.org. Trade fees inside a cell that have not been swept yet are not locked value and are subtracted.
// Outside venues listed on Kasseal (pools of other protocols) are never in this list.
const CELLS = 'https://api.kasseal.com/v1/metrics/cells'

async function tvl(api) {
  const { cells } = await get(CELLS)
  const curves = cells.filter((c) => c.kind === 'curve')
  if (!curves.length) throw new Error('kasseal: no live curve cells listed')
  const balances = await sdk.chains.utxo.getBalances({ chain: 'kaspa', addresses: curves.map((c) => c.address) })
  let sompi = 0n
  for (const c of curves) {
    // A cell spent between the listing and the balance read holds nothing at its old address: it counts 0.
    const locked = BigInt(String(balances[c.address] ?? 0)) - BigInt(c.feeAccruedSompi)
    if (locked > 0n) sompi += locked
  }
  api.addCGToken('kaspa', Number(sompi) / 1e8)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the KAS locked in live Kasseal bonding curves on Kaspa, read from chain balances, minus trade fees not yet swept from the curves. Token-side reserves are not counted. Graduated tokens move to Kasseal pools, which are listed separately.',
  kaspa: { tvl },
}
