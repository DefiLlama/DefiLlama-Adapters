const sdk = require('@defillama/sdk')
const { get } = require('../helper/http')

// Kasseal's indexer lists the live curve cells (discovery only), each cell is a P2SH covenant that moves to a new address on every trade
const CELLS = 'https://api.kasseal.com/v1/metrics/cells'
const ATTEMPTS = 3

async function liveCurves() {
  const { cells } = await get(CELLS)
  return new Map(cells.filter((c) => c.kind === 'curve').map((c) => [c.tokenId, c.address]))
}

async function tvl(api) {
  let curves = await liveCurves()
  const locked = new Map() // tokenId -> sompi
  let pending = [...curves.keys()]
  for (let attempt = 1; pending.length; attempt++) {
    const balances = await sdk.chains.utxo.getBalances({ chain: 'kaspa', addresses: pending.map((t) => curves.get(t)) })
    const empty = []
    for (const t of pending) {
      const sompi = BigInt(balances[curves.get(t)])
      if (sompi > 0n) locked.set(t, sompi)
      else empty.push(t)
    }
    if (!empty.length || attempt === ATTEMPTS) break
    const before = curves
    curves = await liveCurves()
    // an empty curve was traded after the listing: re-read its new address, a token no longer listed has graduated
    pending = empty.filter((t) => curves.has(t) && curves.get(t) !== before.get(t))
  }
  const sompi = [...locked.values()].reduce((a, b) => a + b, 0n)
  api.addCGToken('kaspa', Number(sompi) / 1e8)
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the KAS locked in live Kasseal bonding curves on Kaspa L1. Kasseal\'s indexer lists the live curve cells and each cell\'s KAS balance is read on chain. Token-side reserves are not counted. Graduated tokens move to Kasseal pools, which are listed separately.',
  kaspa: { tvl },
}
