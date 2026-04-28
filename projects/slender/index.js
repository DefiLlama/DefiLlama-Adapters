/**
 * Slender Protocol — TVL + Borrowed adapter
 */

const { callSoroban } = require('../../helper/chain/stellar')
const methodologies = require('../../helper/methodologies')

const POOL_ID = 'CCL2KTHYOVMNNOFDT7PEAHACUBYVFLRH2LYWVQB6IPMHHAVUBC7ZUUC2'

const RESERVES = [
  { symbol: 'XLM',  sac: 'CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA', geckoId: 'stellar',  decimals: 7 },
  { symbol: 'XRP',  sac: 'CAAV3AE3VKD2P4TY7LWTQMMJHIJ4WOCZ5ANCIJPC3NRSERKVXNHBU2W7', geckoId: 'ripple',   decimals: 7 },
  { symbol: 'USDC', sac: 'CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75', geckoId: 'usd-coin', decimals: 7 },
]

const COEFF_PRECISION = 1_000_000_000n

async function getReserveAddresses(assetSac) {
  const rt = await callSoroban(POOL_ID, 'get_reserve', [assetSac])
  if (!Array.isArray(rt) || rt[0] !== 'Fungible' || rt.length < 3) {
    throw new Error(`Unexpected reserve_type for ${assetSac}: ${JSON.stringify(rt)}`)
  }
  return { sTokenAddress: rt[1], debtTokenAddress: rt[2] }
}

function scaleDown(rawBigInt, decimals) {
  const divisor = BigInt(10) ** BigInt(decimals)
  const whole = rawBigInt / divisor
  const rem = rawBigInt % divisor
  return Number(whole) + Number(rem) / (10 ** decimals)
}

/**
 * Cache reserve token addresses to avoid duplicate RPC calls as suggested by CodeRabbit.
 */
async function getResolvedReserves() {
  return Promise.all(
    RESERVES.map(async (r) => {
      const { sTokenAddress, debtTokenAddress } = await getReserveAddresses(r.sac)
      return { ...r, sTokenAddress, debtTokenAddress }
    })
  )
}

async function tvl(api) {
  const reserves = await getResolvedReserves()
  for (const r of reserves) {
    const [sTokenSupply, collatCoeff] = await Promise.all([
      callSoroban(POOL_ID, 'token_total_supply', [r.sTokenAddress]),
      callSoroban(POOL_ID, 'collat_coeff', [r.sac]),
    ])

    const underlyingRaw = (sTokenSupply * collatCoeff) / COEFF_PRECISION
    api.addCGToken(r.geckoId, scaleDown(underlyingRaw, r.decimals))
  }
}

async function borrowed(api) {
  const reserves = await getResolvedReserves()
  for (const r of reserves) {
    const [debtTokenSupply, debtCoeff] = await Promise.all([
      callSoroban(POOL_ID, 'token_total_supply', [r.debtTokenAddress]),
      callSoroban(POOL_ID, 'debt_coeff', [r.sac]),
    ])

    const underlyingRaw = (debtTokenSupply * debtCoeff) / COEFF_PRECISION
    api.addCGToken(r.geckoId, scaleDown(underlyingRaw, r.decimals))
  }
}

module.exports = {
  timetravel: false,
  methodology: `${methodologies.lendingMarket}. TVL derived from sToken total supply × collateral coefficient per reserve.`,
  stellar: { tvl, borrowed },
}
