const LENDING_CANISTER_ID = 'hyk4r-jqaaa-aaaar-qb4ca-cai'
const BTC_POOL_CANISTER_ID = 'hkmli-faaaa-aaaar-qb4ba-cai'
const ETH_POOL_CANISTER_ID = 'hnnn4-iyaaa-aaaar-qb4bq-cai'
const ALLOWED_POOL_CANISTERS = new Set([
  BTC_POOL_CANISTER_ID,
  ETH_POOL_CANISTER_ID,
])
const ICP_HOST = 'https://icp-api.io'

const ASSET_META = {
  BTC: { decimals: 8, coingeckoId: 'bitcoin' },
  SOL: { decimals: 9, coingeckoId: 'solana' },
  USDC: { decimals: 6, coingeckoId: 'usd-coin' },
  USDT: { decimals: 6, coingeckoId: 'tether' },
}
const CHAIN_MAP = {
  BTC: 'bitcoin',
  ETH: 'ethereum',
  SOL: 'solana',
}

const idlFactory = ({ IDL }) => {
  const Assets = IDL.Variant({
    BTC: IDL.Null,
    SOL: IDL.Null,
    USDC: IDL.Null,
    USDT: IDL.Null,
  })
  const Chains = IDL.Variant({
    BTC: IDL.Null,
    ETH: IDL.Null,
    SOL: IDL.Null,
  })
  const AssetType = IDL.Variant({
    CkAsset: IDL.Principal,
    Unknown: IDL.Null,
  })
  const Pool = IDL.Record({
    optimal_utilization_rate: IDL.Nat,
    principal: IDL.Principal,
    total_generated_interest_snapshot: IDL.Nat,
    asset_type: AssetType,
    supply_cap: IDL.Opt(IDL.Nat),
    same_asset_borrowing: IDL.Opt(IDL.Bool),
    asset: Assets,
    rate_slope_before: IDL.Nat,
    borrow_cap: IDL.Opt(IDL.Nat),
    total_debt_at_last_sync: IDL.Nat,
    supply_at_last_sync: IDL.Nat,
    chain: Chains,
    rate_slope_after: IDL.Nat,
    reserve_factor: IDL.Nat64,
    last_updated: IDL.Opt(IDL.Nat64),
    lending_index: IDL.Nat,
    protocol_liquidation_fee: IDL.Nat64,
    treasury_supply_scaled: IDL.Nat,
    same_asset_borrowing_dust_threshold: IDL.Nat,
    borrow_index: IDL.Nat,
    base_rate: IDL.Nat,
    frozen: IDL.Bool,
    liquidation_bonus: IDL.Nat64,
    liquidation_threshold: IDL.Nat64,
    max_ltv: IDL.Nat64,
    repay_grace_period: IDL.Opt(IDL.Nat64),
    pending_service_fees: IDL.Nat,
    total_supply_at_last_sync: IDL.Nat,
  })
  return IDL.Service({
    list_pools: IDL.Func([], [IDL.Vec(Pool)], ['query']),
  })
}

const getVariantKey = (variant) => Object.keys(variant)[0]
const toNumber = (value) => Number(value ?? 0)

let poolsPromise
async function getPools() {
  if (!poolsPromise) {
    poolsPromise = (async () => {
      const { HttpAgent, Actor } = await import('@dfinity/agent')
      const agent = new HttpAgent({ host: ICP_HOST })
      const actor = Actor.createActor(idlFactory, {
        agent,
        canisterId: LENDING_CANISTER_ID,
      })
      const pools = await actor.list_pools()
      return pools.filter((pool) =>
        ALLOWED_POOL_CANISTERS.has(pool.principal.toString())
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

  const supplyRaw = toNumber(pool.total_supply_at_last_sync)
  const debtRaw = toNumber(pool.total_debt_at_last_sync)
  const available = (supplyRaw - debtRaw) / 10 ** meta.decimals
  if (available > 0) api.addCGToken(meta.coingeckoId, available)
}

function addBorrowed(api, pool) {
  const asset = getVariantKey(pool.asset)
  const meta = ASSET_META[asset]
  if (!meta) return

  const borrowed = toNumber(pool.total_debt_at_last_sync) / 10 ** meta.decimals
  if (borrowed > 0) api.addCGToken(meta.coingeckoId, borrowed)
}

async function chainTvl(api, chain) {
  const pools = await getPools()
  pools
    .filter((pool) => CHAIN_MAP[getVariantKey(pool.chain)] === chain)
    .forEach((pool) => addNetSupply(api, pool))
}

async function chainBorrowed(api, chain) {
  const pools = await getPools()
  pools
    .filter((pool) => CHAIN_MAP[getVariantKey(pool.chain)] === chain)
    .forEach((pool) => addBorrowed(api, pool))
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is net available liquidity (total supply minus total borrow) from Liquidium lending pools, grouped by the pool chain variant (BTC or ETH). Borrowed is total outstanding debt per pool on the same chain grouping.',
  bitcoin: {
    tvl: (api) => chainTvl(api, 'bitcoin'),
    borrowed: (api) => chainBorrowed(api, 'bitcoin'),
  },
  ethereum: {
    tvl: (api) => chainTvl(api, 'ethereum'),
    borrowed: (api) => chainBorrowed(api, 'ethereum'),
  },
}
