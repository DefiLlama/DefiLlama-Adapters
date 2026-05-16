const { queryCanister, decodeCandid, hashCandidLabel } = require('../helper/chain/icp')

const LENDING_CANISTER_ID = 'hyk4r-jqaaa-aaaar-qb4ca-cai'
const BTC_POOL_CANISTER_ID = 'hkmli-faaaa-aaaar-qb4ba-cai'
const ETH_POOL_CANISTER_ID = 'hnnn4-iyaaa-aaaar-qb4bq-cai'
const ALLOWED_POOL_CANISTERS = new Set([BTC_POOL_CANISTER_ID, ETH_POOL_CANISTER_ID])
const MAX_SAFE_BIGINT = BigInt(Number.MAX_SAFE_INTEGER)

const ASSET_META = {
  BTC: { decimals: 8, coingeckoId: 'bitcoin' },
  SOL: { decimals: 9, coingeckoId: 'solana' },
  USDC: { decimals: 6, coingeckoId: 'usd-coin' },
  USDT: { decimals: 6, coingeckoId: 'tether' },
}

const CANDID_LABELS = [
  'optimal_utilization_rate', 'principal', 'total_generated_interest_snapshot',
  'asset_type', 'supply_cap', 'same_asset_borrowing', 'asset', 'rate_slope_before',
  'borrow_cap', 'total_debt_at_last_sync', 'supply_at_last_sync', 'chain',
  'rate_slope_after', 'reserve_factor', 'last_updated', 'lending_index',
  'protocol_liquidation_fee', 'treasury_supply_scaled', 'same_asset_borrowing_dust_threshold',
  'borrow_index', 'base_rate', 'frozen', 'liquidation_bonus', 'liquidation_threshold',
  'max_ltv', 'repay_grace_period', 'pending_service_fees', 'total_supply_at_last_sync',
  'BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'CkAsset', 'Unknown',
]

const LABEL_HASH_MAP = Object.fromEntries(
  CANDID_LABELS.map((label) => [hashCandidLabel(label), label])
)

const getVariantKey = (variant) => Object.keys(variant)[0]

function toBigInt(value) {
  if (value === null || value === undefined) return 0n
  if (typeof value === 'bigint') return value
  return BigInt(value)
}

function toTokenAmount(rawAmount, decimals) {
  if (typeof rawAmount !== 'bigint') return Number(rawAmount) / 10 ** decimals
  const divisor = 10n ** BigInt(decimals)
  const whole = rawAmount / divisor
  const remainder = rawAmount % divisor
  const absolute = whole < 0n ? -whole : whole
  if (absolute > MAX_SAFE_BIGINT) throw new Error('Token amount exceeds JS safe integer range')
  return Number(whole) + Number(remainder) / 10 ** decimals
}

let poolsPromise
async function getPools() {
  if (!poolsPromise) {
    poolsPromise = (async () => {
      const candidResponse = await queryCanister({
        canisterId: LENDING_CANISTER_ID,
        methodName: 'list_pools',
      })
      const [pools] = decodeCandid(candidResponse, LABEL_HASH_MAP)
      return pools.filter(
        (pool) => ALLOWED_POOL_CANISTERS.has(pool.principal) && pool.frozen === false
      )
    })().catch((error) => {
      poolsPromise = null
      throw error
    })
  }
  return poolsPromise
}

function addNetSupply(api, pool) {
  const asset = getVariantKey(pool.asset)
  const meta = ASSET_META[asset]
  if (!meta) return
  const availableRaw = toBigInt(pool.total_supply_at_last_sync) - toBigInt(pool.total_debt_at_last_sync)
  const available = toTokenAmount(availableRaw, meta.decimals)
  if (available > 0) api.addCGToken(meta.coingeckoId, available)
}

function addBorrowed(api, pool) {
  const asset = getVariantKey(pool.asset)
  const meta = ASSET_META[asset]
  if (!meta) return
  const borrowed = toTokenAmount(toBigInt(pool.total_debt_at_last_sync), meta.decimals)
  if (borrowed > 0) api.addCGToken(meta.coingeckoId, borrowed)
}

async function tvl(api) {
  const pools = await getPools()
  pools.forEach((pool) => addNetSupply(api, pool))
}

async function borrowed(api) {
  const pools = await getPools()
  pools.forEach((pool) => addBorrowed(api, pool))
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is net available liquidity (total supply minus total borrow) from Liquidium lending pools on ICP. Borrowed is total outstanding debt per pool.',
  icp: {
    tvl,
    borrowed,
  },
}