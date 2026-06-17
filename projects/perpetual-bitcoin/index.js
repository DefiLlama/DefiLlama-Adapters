// Perpetual Bitcoin (PB) — TVL adapter
//
// Protocol: https://perpetualbitcoin.io
// Chain: PulseChain (pulse)
// Contracts (all immutable, no admin):
//   Vault:      0x0E04D1CaC6212447447ad66A5e57a8910425975F
//   PB token:   0xb47Fa3fdA09E61a68A8089E1f4d0F44bd993E6B9
//   USDL:       0x0dEEd1486bc52aA0d3E6f8849cEC5adD6598A162
//   PB/USDL LP: 0x3533719b2F72cB55E19dA72155E2FC5eC0BCA4F1  (PulseX V2)
//
// TVL methodology:
//   The Vault permanently holds all protocol-owned PB/USDL LP tokens
//   (tracked via vaultLPTokenBalance state var; never transferred out).
//   TVL = Vault's proportional share of USDL in the PulseX pair.
//
//   Excluded from TVL:
//   - PB native inventory in the Vault (protocol-issued supply, not external capital)
//   - PBc balances (non-transferable accounting/claim token, not a locked external asset)
//   - USDL does NOT sit in the Vault in steady state; it is fully transient per-tx
//
//   USDL is the only stablecoin used by the protocol (~$1 peg, no admin/blacklist/freeze).
//   It is token0 in the PulseX pair (verified on-chain).

const VAULT      = '0x0E04D1CaC6212447447ad66A5e57a8910425975F'
const USDL       = '0x0dEEd1486bc52aA0d3E6f8849cEC5adD6598A162' // token0 in pair
const PB_USDL_LP = '0x3533719b2F72cB55E19dA72155E2FC5eC0BCA4F1'

async function tvl(api) {
  // Read vault's LP token balance, total LP supply, and pair reserves in parallel
  const [lpBalance, lpSupply, reserves] = await Promise.all([
    api.call({ abi: 'erc20:balanceOf',   target: PB_USDL_LP, params: [VAULT] }),
    api.call({ abi: 'erc20:totalSupply', target: PB_USDL_LP }),
    api.call({
      abi: 'function getReserves() view returns (uint112 reserve0, uint112 reserve1, uint32)',
      target: PB_USDL_LP,
    }),
  ])

  // USDL is token0 — calculate Vault's proportional USDL share
  const usdlInPair    = BigInt(reserves[0])
  const vaultLpShare  = BigInt(lpBalance)
  const totalLpSupply = BigInt(lpSupply)

  if (totalLpSupply === 0n) return

  const vaultUsdl = (usdlInPair * vaultLpShare) / totalLpSupply
  api.add(USDL, vaultUsdl)
}

module.exports = {
  // 2026-04-09: initial LP seeded at launch (protocol start)
  start: 1775692800,
  methodology:
    'TVL is the Vault\'s proportional share of USDL in the protocol-owned PB/USDL LP on PulseX. ' +
    'The Vault permanently holds all protocol LP tokens and never transfers them out. ' +
    'PB native inventory (protocol-issued supply) and PBc claim balances are excluded. ' +
    'USDL is the only stablecoin in the protocol; it has no blacklist, freeze, or admin controls.',
  pulse: {
    tvl,
  },
}