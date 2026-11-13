const { getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const { getCache, setCache } = require('../helper/cache')

// Vaultex (https://vaultex.fun): Solana meme coin launchpad built on Meteora's
// Dynamic Bonding Curve. Coins can be paired with several quote assets (SOL,
// USDC, PUMP and others), one DBC config per quote asset. Every Vaultex config
// carries the same partner fee claimer, which is fixed at config creation, so
// configs are found by it. Pools created against those configs are Vaultex coins.
const DBC_PROGRAM = new PublicKey('dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN')
const VAULTEX_FEE_CLAIMER = '4wwpefxyZ2nqeePNa2fctMuu5273wrzkUuoy5wC2QeP2'

// Anchor discriminators, sha256("account:<Name>")[0..8], base58
const POOL_CONFIG_DISC = '5RKzUGPpkkA' // PoolConfig
const VIRTUAL_POOL_DISC = 'cmrfVvtHrjd' // VirtualPool

// PoolConfig: 8 disc | 32 quote_mint | 32 fee_claimer | ...
const CONFIG_QUOTE_MINT_OFFSET = 8
const CONFIG_FEE_CLAIMER_OFFSET = 40
// VirtualPool: config pubkey @72, quote_reserve u64 @240, is_migrated u8 @305
const POOL_CONFIG_OFFSET = 72
const QUOTE_RESERVE_OFFSET = 240
const IS_MIGRATED_OFFSET = 305
const NOT_MIGRATED = '1' // base58 of the single byte 0x00

const CACHE_PROJECT = 'vaultex'
const CACHE_KEY = 'solana-empty-configs'
const EMPTY_CONFIG_RECHECK_SECONDS = 7 * 24 * 3600

async function tvl(api) {
  const connection = getConnection()

  const configs = await connection.getProgramAccounts(DBC_PROGRAM, {
    filters: [
      { memcmp: { offset: 0, bytes: POOL_CONFIG_DISC } },
      { memcmp: { offset: CONFIG_FEE_CLAIMER_OFFSET, bytes: VAULTEX_FEE_CLAIMER } },
    ],
    dataSlice: { offset: CONFIG_QUOTE_MINT_OFFSET, length: 32 },
  })

  // most configs have no live pools: those are re-checked once a week, the rest (and new configs) every run
  const { emptyConfigs = {} } = await getCache(CACHE_PROJECT, CACHE_KEY)
  const now = Math.floor(Date.now() / 1000)

  for (const { pubkey, account } of configs) {
    const config = pubkey.toBase58()
    if (now - emptyConfigs[config] < EMPTY_CONFIG_RECHECK_SECONDS) continue

    const quoteMint = new PublicKey(account.data).toBase58()
    // one getProgramAccounts per config: memcmp filters can't be OR'ed
    const pools = await connection.getProgramAccounts(DBC_PROGRAM, {
      filters: [
        { memcmp: { offset: 0, bytes: VIRTUAL_POOL_DISC } },
        { memcmp: { offset: POOL_CONFIG_OFFSET, bytes: config } },
        // migration moves the reserve to DAMM v2 but leaves quote_reserve unchanged, so migrated pools are filtered out by the RPC
        { memcmp: { offset: IS_MIGRATED_OFFSET, bytes: NOT_MIGRATED } },
      ],
      dataSlice: { offset: QUOTE_RESERVE_OFFSET, length: 8 },
    })
    // quote_reserve excludes the unclaimed protocol, partner and creator fees that sit in the same quote vault
    for (const { account: { data } } of pools)
      api.add(quoteMint, data.readBigUInt64LE(0).toString())

    if (pools.length) delete emptyConfigs[config]
    else emptyConfigs[config] = now
  }

  await setCache(CACHE_PROJECT, CACHE_KEY, { emptyConfigs })
}

module.exports = {
  timetravel: false,
  isHeavyProtocol: true,
  methodology:
    'TVL is the quote asset (SOL, USDC, PUMP and others) held as reserves in Vaultex bonding curves on Meteora Dynamic Bonding Curve. Vaultex pools are the pools created against DBC configs whose partner fee claimer is the Vaultex treasury. Launched tokens and unclaimed trading fees are not counted. Graduated curves are excluded: their liquidity moves to Meteora DAMM v2 and is counted there.',
  solana: { tvl },
}
