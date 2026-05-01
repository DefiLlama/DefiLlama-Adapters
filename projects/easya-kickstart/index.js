const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// Meteora Dynamic Bonding Curve program — EasyA Kickstart launchpad is built on top of it.
// Each token launched on Kickstart is a `VirtualPool` account in this program; the pool
// is identified as belonging to Kickstart by its `config` field pointing at one of the
// PoolConfig accounts owned by EasyA. All three PoolConfigs share the same fee_claimer
// (EfgbywXHbDnkbr4hqSv9dyo9hUJ62jmi2fm4e6gP2jLb), confirming common ownership.
const METEORA_DBC_PROGRAM = 'dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN'

const EASYA_PARTNER_CONFIGS = [
  'FctVFHQvVaj3hTDHCSXZjTmmsRs5bX5ogUPGHFSgrJpU',
  'NHT6MNushFNWpaFgQs5k49HHzsas9jQAVoRvqyXc5Qx',
  '6iEekXhre85eDB1mxRuXbRDHbSG8HeSPYopp9e7fp4BJ',
]

// Meteora DBC VirtualPool layout (account size 424 bytes, C-repr bytemuck):
// 0   : 8   anchor discriminator
// 8   : 64  VolatilityTracker
// 72  : 32  config           ← memcmp filter target
// 240 : 8   quote_reserve    (u64 LE, lamports of quote token = wSOL)
// 305 : 1   is_migrated      (0 = active on bonding curve, 1 = migrated to DAMM V2)
const VIRTUAL_POOL_SIZE = 424
const VIRTUAL_POOL_DISCRIMINATOR = Buffer.from([213, 224, 5, 209, 98, 69, 119, 92])
const CONFIG_OFFSET = 72
const QUOTE_RESERVE_OFFSET = 240
const IS_MIGRATED_OFFSET = 305

const WSOL = ADDRESSES.solana.SOL

async function tvl(api) {
  const connection = getConnection()
  const programId = new PublicKey(METEORA_DBC_PROGRAM)

  const seen = new Set()
  for (const config of EASYA_PARTNER_CONFIGS) {
    const accounts = await connection.getProgramAccounts(programId, {
      filters: [
        { dataSize: VIRTUAL_POOL_SIZE },
        { memcmp: { offset: CONFIG_OFFSET, bytes: config } },
      ],
    })

    for (const { pubkey, account } of accounts) {
      const key = pubkey.toBase58()
      if (seen.has(key)) continue
      seen.add(key)

      const data = account.data
      if (data.length < IS_MIGRATED_OFFSET + 1) continue
      if (!VIRTUAL_POOL_DISCRIMINATOR.equals(data.subarray(0, 8))) continue
      if (data.readUInt8(IS_MIGRATED_OFFSET) !== 0) continue

      const quoteReserve = data.readBigUInt64LE(QUOTE_RESERVE_OFFSET)
      if (quoteReserve > 0n) api.add(WSOL, quoteReserve.toString())
    }
  }
}

module.exports = {
  timetravel: false,
  methodology:
    'Sum of WSOL reserves locked in active EasyA Kickstart bonding curves on Solana. ' +
    'Kickstart is built on top of Meteora Dynamic Bonding Curve; each launched token is a ' +
    'VirtualPool whose `config` field points to one of EasyA\'s PoolConfig accounts. ' +
    'Migrated (graduated) pools are excluded — their liquidity has moved to Meteora DAMM V2 ' +
    'and is tracked separately under Meteora.',
  solana: { tvl },
}
