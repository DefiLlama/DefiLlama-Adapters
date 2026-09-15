const sui = require('../helper/chain/sui')

// Kelpie: per-user concentrated-liquidity vaults on Sui. Each vault is a shared
// object holding one CLMM position plus idle balances, on SuiDex V3 or Cetus.
// Types are stamped with each package's ORIGINAL id, which never changes on upgrade.
const VAULT_PACKAGES = [
  '0x63d5fa6a5e173de759525146d52148a8aa38168d3daffbbbc0ad382487b7c1ec', // Kelpie-SuiDex
  '0x8751d82e4a6c0eb08d09db745f0b73d6d7c7876a40ffbead791ed8b64c5e2bc8', // Kelpie-Cetus
]

const Q64 = 2 ** 64

const signed32 = (bits) => {
  const b = Number(bits)
  return b >= 2 ** 31 ? b - 2 ** 32 : b
}

// "pkg::vault::Vault<A, B>" -> [A, B]
function typeArgs(type) {
  const inner = type.slice(type.indexOf('<') + 1, type.lastIndexOf('>'))
  return inner.split(',').map((s) => s.trim())
}

// Token amounts of a CLMM position, from liquidity and the pool's sqrt price.
function positionAmounts(liquidity, sqrtPriceX64, tickLower, tickUpper) {
  const L = Number(liquidity)
  if (!L) return [0, 0]
  const sp = Number(sqrtPriceX64) / Q64
  const sa = Math.pow(1.0001, tickLower / 2)
  const sb = Math.pow(1.0001, tickUpper / 2)
  if (sp <= sa) return [(L * (sb - sa)) / (sa * sb), 0]
  if (sp < sb) return [(L * (sb - sp)) / (sp * sb), L * (sp - sa)]
  return [0, L * (sb - sa)]
}

async function tvl(api) {
  for (const pkg of VAULT_PACKAGES) {
    // Listed by type for the ids, then re-read without the type layout: the
    // layout pass drops the contents of Option<Position>.
    const ids = (await sui.getObjectsByType(`${pkg}::vault::Vault`)).map((v) => v.fields.id.id)
    const vaults = (await sui.getObjects(ids, { skipLayout: true })).filter(Boolean)

    const poolIds = [...new Set(vaults.map((v) => v.fields.pool_id))]
    const pools = await sui.getObjects(poolIds, { skipLayout: true })
    const sqrtPrice = {}
    poolIds.forEach((id, i) => {
      const f = pools[i]?.fields
      if (f) sqrtPrice[id] = f.sqrt_price ?? f.current_sqrt_price
    })

    for (const v of vaults) {
      const f = v.fields
      const [coinA, coinB] = typeArgs(v.type)

      // Idle balances: SuiDex names them _x/_y, Cetus _a/_b.
      api.add(coinA, f.balance_x ?? f.balance_a ?? 0)
      api.add(coinB, f.balance_y ?? f.balance_b ?? 0)

      const p = f.position?.fields
      const price = sqrtPrice[f.pool_id]
      if (!p || !price) continue
      const [a, b] = positionAmounts(
        p.liquidity,
        price,
        signed32(p.tick_lower_index.fields.bits),
        signed32(p.tick_upper_index.fields.bits),
      )
      api.add(coinA, Math.floor(a))
      api.add(coinB, Math.floor(b))
    }
  }
}

module.exports = {
  timetravel: false,
  doublecounted: true,
  methodology:
    'TVL is the value of every live Kelpie vault: its concentrated-liquidity position on SuiDex V3 or Cetus, converted to token amounts at the pool\'s current price, plus the idle balances the vault holds. The positions sit in those DEX pools, so this is also counted in their TVL.',
  sui: { tvl },
}
