/**
 * Slender Protocol — TVL + Borrowed adapter
 *
 * Slender is a noncustodial overcollateralized lending protocol on Soroban (Stellar).
 * Users deposit XLM, XRP, or USDC into a per-reserve sToken contract and receive
 * sTokens (interest-accruing receipt tokens). Borrowed underlying leaves the
 * sToken contract; deposits earning interest stay there.
 *
 * Data flow (per reserve):
 *   pool.get_reserve(asset) → { reserve_type: ["Fungible", s_token, debt_token], ... }
 *   <asset_SAC>.balance(s_token) → underlying held by the sToken contract = TVL
 *
 *   pool.token_total_supply(debt_token) × pool.debt_coeff(asset) / 1e9 = borrowed
 *
 * Source: https://github.com/eq-lab/slender
 */

const { callSoroban } = require('../helper/chain/stellar')
const methodologies = require('../helper/methodologies')

const POOL_ID = 'CCL2KTHYOVMNNOFDT7PEAHACUBYVFLRH2LYWVQB6IPMHHAVUBC7ZUUC2'

const RESERVES = [
  { symbol: 'XLM', sac: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA' },
  { symbol: 'XRP', sac: 'CAAV3AE3VKD2P4TY7LWTQMMJHIJ4WOCZ5ANCIJPC3NRSERKVXNHBU2W7' },
  { symbol: 'USDC', sac: 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75' },
]

const COEFF_PRECISION = 1_000_000_000n

async function getReserveAddresses(assetSac) {
  const data = await callSoroban(POOL_ID, 'get_reserve', [assetSac])
  const rt = data?.reserve_type
  if (!Array.isArray(rt) || rt[0] !== 'Fungible' || rt.length < 3) {
    throw new Error(`Unexpected reserve_type for ${assetSac}: ${JSON.stringify(rt)}`)
  }
  return { sTokenAddress: rt[1], debtTokenAddress: rt[2] }
}

async function tvl(api) {
  for (const r of RESERVES) {
    const { sTokenAddress } = await getReserveAddresses(r.sac)
    const balance = await callSoroban(r.sac, 'balance', [sTokenAddress])
    api.add(r.sac, balance.toString())
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
    api.add(r.sac, underlyingRaw.toString())
  }
}

module.exports = {
  timetravel: false,
  methodology: methodologies.lendingMarket,
  stellar: {
    tvl,
    borrowed,
  },
}
