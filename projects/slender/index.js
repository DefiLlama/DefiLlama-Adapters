/**
 * Slender Protocol — TVL + Borrowed adapter
 *
 * Slender is a noncustodial overcollateralized lending protocol on Soroban (Stellar).
 * Users deposit XLM, XRP, or USDC and receive sTokens (interest-accruing receipt tokens).
 *
 * Data flow (per reserve):
 *   pool.get_reserve(asset) → { reserve_type: ["Fungible", s_token, debt_token], ... }
 *   pool.token_total_supply(s_token)   → sToken supply  (in 1e7 asset units)
 *   pool.collat_coeff(asset)           → coefficient     (1e9 precision, starts at 1e9)
 *   underlying_deposited = sToken_supply × collat_coeff / 1e9
 *
 *   pool.token_total_supply(debt_token) → debtToken supply (in 1e7 asset units)
 *   pool.debt_coeff(asset)              → coefficient      (1e9 precision)
 *   underlying_borrowed = debtToken_supply × debt_coeff / 1e9
 *
 * Stellar Community Fund grant: $97,500 | Live: 2024-08-01
 * Source: https://github.com/eq-lab/slender
 */

const { callSoroban } = require('../helper/chain/stellar')
const methodologies = require('../helper/methodologies')

const POOL_ID = 'CCL2KTHYOVMNNOFDT7PEAHACUBYVFLRH2LYWVQB6IPMHHAVUBC7ZUUC2'

// Stellar Asset Contract (SAC) address for each reserve — passed to pool.get_reserve(asset).
// Decimals: 7 (standard for all Stellar/Soroban token contracts)
const RESERVES = [
  { symbol: 'XLM',  sac: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA', geckoId: 'stellar',  decimals: 7 },
  { symbol: 'XRP',  sac: 'CAAV3AE3VKD2P4TY7LWTQMMJHIJ4WOCZ5ANCIJPC3NRSERKVXNHBU2W7', geckoId: 'ripple',   decimals: 7 },
  { symbol: 'USDC', sac: 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75', geckoId: 'usd-coin', decimals: 7 },
]

const COEFF_PRECISION = 1_000_000_000n // 1e9 — Slender stores coefficients at 9 decimal precision

async function getReserveAddresses(assetSac) {
  const data = await callSoroban(POOL_ID, 'get_reserve', [assetSac])
  // reserve_type is a VEC: ["Fungible", s_token_address, debt_token_address]
  const rt = data?.reserve_type
  if (!Array.isArray(rt) || rt[0] !== 'Fungible' || rt.length < 3) {
    throw new Error(`Unexpected reserve_type for ${assetSac}: ${JSON.stringify(rt)}`)
  }
  return { sTokenAddress: rt[1], debtTokenAddress: rt[2] }
}

async function tvl(api) {
  for (const r of RESERVES) {
    const { sTokenAddress } = await getReserveAddresses(r.sac)

    // sToken supply and the collateral coefficient (sToken → underlying exchange rate)
    const [sTokenSupply, collatCoeff] = await Promise.all([
      callSoroban(POOL_ID, 'token_total_supply', [sTokenAddress]),
      callSoroban(POOL_ID, 'collat_coeff', [r.sac]),
    ])

    // underlying_in_1e7 = sTokenSupply × collatCoeff / 1e9
    // then divide by 1e7 to get the human-readable token amount
    const underlyingRaw = sTokenSupply * collatCoeff / COEFF_PRECISION
    api.addCGToken(r.geckoId, Number(underlyingRaw) / Math.pow(10, r.decimals))
  }
}

async function borrowed(api) {
  for (const r of RESERVES) {
    const { debtTokenAddress } = await getReserveAddresses(r.sac)

    const [debtTokenSupply, debtCoeff] = await Promise.all([
      callSoroban(POOL_ID, 'token_total_supply', [debtTokenAddress]),
      callSoroban(POOL_ID, 'debt_coeff', [r.sac]),
    ])

    const underlyingRaw = debtTokenSupply * debtCoeff / COEFF_PRECISION
    api.addCGToken(r.geckoId, Number(underlyingRaw) / Math.pow(10, r.decimals))
  }
}

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket}. TVL is derived from sToken total supply × collateral coefficient per reserve; borrowed from debtToken total supply × debt coefficient per reserve. Both queried on-chain via Soroban RPC simulation of pool.get_reserve(), pool.token_total_supply(), pool.collat_coeff(), and pool.debt_coeff().`,
  stellar: {
    tvl,
    borrowed,
  },
}
