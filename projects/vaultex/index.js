const { getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')
const { sleep } = require('../helper/utils')

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

async function tvl(api) {
  const connection = getConnection()

  const configs = await connection.getProgramAccounts(DBC_PROGRAM, {
    filters: [
      { memcmp: { offset: 0, bytes: POOL_CONFIG_DISC } },
      { memcmp: { offset: CONFIG_FEE_CLAIMER_OFFSET, bytes: VAULTEX_FEE_CLAIMER } },
    ],
    dataSlice: { offset: CONFIG_QUOTE_MINT_OFFSET, length: 32 },
  })

  for (const { pubkey, account } of configs) {
    const quoteMint = new PublicKey(account.data).toBase58()
    // one getProgramAccounts per config; spaced so public RPCs don't rate-limit (429)
    await sleep(1200)
    const pools = await connection.getProgramAccounts(DBC_PROGRAM, {
      filters: [
        { memcmp: { offset: 0, bytes: VIRTUAL_POOL_DISC } },
        { memcmp: { offset: POOL_CONFIG_OFFSET, bytes: pubkey.toBase58() } },
      ],
      dataSlice: { offset: QUOTE_RESERVE_OFFSET, length: IS_MIGRATED_OFFSET - QUOTE_RESERVE_OFFSET + 1 },
    })
    for (const { account: { data } } of pools) {
      // migration moves the reserve to DAMM v2 but leaves quote_reserve unchanged
      if (data.readUInt8(IS_MIGRATED_OFFSET - QUOTE_RESERVE_OFFSET) !== 0) continue
      // quote_reserve excludes the unclaimed protocol, partner and creator fees that sit in the same quote vault
      api.add(quoteMint, data.readBigUInt64LE(0).toString())
    }
  }
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the quote asset (SOL, USDC, PUMP and others) held as reserves in Vaultex bonding curves on Meteora Dynamic Bonding Curve. Vaultex pools are the pools created against DBC configs whose partner fee claimer is the Vaultex treasury. Launched tokens and unclaimed trading fees are not counted. Graduated curves are excluded: their liquidity moves to Meteora DAMM v2 and is counted there.',
  solana: { tvl },
}
