const sui = require('../helper/chain/sui')
const { addUniV3LikePosition } = require('../helper/unwrapLPs')

// Kelpie: per-user concentrated-liquidity vaults on Sui. Each vault is a shared
// object holding one CLMM position plus idle balances, on SuiDex V3 or Cetus.
// Types are stamped with each package's ORIGINAL id, which never changes on upgrade.
const VAULT_PACKAGES = [
  '0x63d5fa6a5e173de759525146d52148a8aa38168d3daffbbbc0ad382487b7c1ec', // Kelpie-SuiDex
  '0x8751d82e4a6c0eb08d09db745f0b73d6d7c7876a40ffbead791ed8b64c5e2bc8', // Kelpie-Cetus
]

const signed32 = (bits) => {
  const b = Number(bits)
  return b >= 2 ** 31 ? b - 2 ** 32 : b
}

const sqrtPriceToTick = (sqrtPriceX64) => Math.floor(Math.log((sqrtPriceX64 / 2 ** 64) ** 2) / Math.log(1.0001))

// "pkg::vault::Vault<A, B>" -> [A, B]
function typeArgs(type) {
  const inner = type.slice(type.indexOf('<') + 1, type.lastIndexOf('>'))
  return inner.split(',').map((s) => s.trim())
}

async function tvl(api) {
  for (const pkg of VAULT_PACKAGES) {
    // Listed by type for the ids, then re-read without the type layout: the
    // layout pass drops the contents of Option<Position>.
    const ids = (await sui.getObjectsByType(`${pkg}::vault::Vault`)).map((v) => v.fields.id.id)
    const vaults = (await sui.getObjects(ids, { skipLayout: true })).filter(Boolean)

    const poolIds = [...new Set(vaults.map((v) => v.fields.pool_id))]
    const pools = await sui.getObjects(poolIds, { skipLayout: true })
    const poolTick = {}
    poolIds.forEach((id, i) => {
      const f = pools[i]?.fields
      if (f) poolTick[id] = sqrtPriceToTick(f.sqrt_price ?? f.current_sqrt_price)
    })

    for (const v of vaults) {
      const f = v.fields
      const [coinA, coinB] = typeArgs(v.type)

      // Idle balances: SuiDex names them _x/_y, Cetus _a/_b.
      api.add(coinA, f.balance_x ?? f.balance_a ?? 0)
      api.add(coinB, f.balance_y ?? f.balance_b ?? 0)

      const p = f.position?.fields
      const tick = poolTick[f.pool_id]
      if (!p || tick === undefined) continue
      addUniV3LikePosition({
        api,
        token0: coinA,
        token1: coinB,
        liquidity: Number(p.liquidity),
        tickLower: signed32(p.tick_lower_index.fields.bits),
        tickUpper: signed32(p.tick_upper_index.fields.bits),
        tick,
      })
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
