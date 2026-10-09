const { callSoroban } = require('../helper/chain/stellar')

const REGISTRY = 'CCUGRASBWD5SXDYMS7NM437FQ7KNKHFX74D2VRJVTRU4J2TWDMURUW3V'

async function tvl(api) {
  const count = await callSoroban(REGISTRY, 'get_pt_count')
  const seen = new Set()

  for (let i = 0; i < count; i++) {
    const pt = await callSoroban(REGISTRY, 'get_pt_at', [i])
    // Registry indices are append-only; removing a PT leaves an empty slot.
    if (!pt || seen.has(pt)) continue
    seen.add(pt)

    const [underlying, assets] = await Promise.all([
      callSoroban(pt, 'underlying'),
      // total_assets values only this PT's IBT holdings via preview_redeem.
      // Include matured PTs while collateral remains in the contract.
      callSoroban(pt, 'total_assets'),
    ])
    api.add(underlying, assets.toString())
  }
}

module.exports = { timetravel: false, tvl }
