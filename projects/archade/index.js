const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// Archade launches coins onto bonding curves that live in the Meteora Dynamic
// Bonding Curve (DBC) program, under Archade's own partner configs. Every curve
// created under a config is a VirtualPool account whose `config` field is that
// config pubkey, so one getProgramAccounts call per config (memcmp on the
// config field) returns the complete set. No protocol API is involved.
const DBC_PROGRAM = new PublicKey('dbcij3LWUppWqq96dh6gJWwBifmcGfLSB5D4DuSMaqN')

// Both configs are quoted in wSOL (the config's quote_mint). A future config
// with a different quote token is a one-line addition here.
const WSOL = ADDRESSES.solana.SOL
const ARCHADE_CONFIGS = [
  { config: 'HeaH1eyowUas1U9f9646CJ866jNGNzeCsCzeGJ8ryMbe', quoteMint: WSOL }, // production
  { config: 'ELnnqpYUMoKtkULm4LZ4uyashtxpgaccqucZdCY7Ym6H', quoteMint: WSOL }, // test
]

// DBC VirtualPool account layout (424 bytes: 8-byte anchor discriminator + C-repr struct).
// Offsets verified against live mainnet pools; same layout printr-protocol reads.
const VIRTUAL_POOL_SIZE = 424
const VIRTUAL_POOL_DISCRIMINATOR = Buffer.from([213, 224, 5, 209, 98, 69, 119, 92])
const CONFIG_OFFSET = 72         // pubkey
const QUOTE_RESERVE_OFFSET = 240 // u64 LE, quote tokens backing the curve
const IS_MIGRATED_OFFSET = 305   // u8, 0 = active curve, 1 = liquidity moved to a DEX pool

async function tvl(api) {
  const connection = getConnection()

  for (const { config, quoteMint } of ARCHADE_CONFIGS) {
    const accounts = await connection.getProgramAccounts(DBC_PROGRAM, {
      dataSlice: { offset: 0, length: IS_MIGRATED_OFFSET + 1 }, // covers every field read below
      filters: [
        { dataSize: VIRTUAL_POOL_SIZE },
        { memcmp: { offset: CONFIG_OFFSET, bytes: config } },
      ],
    })

    for (const { account: { data } } of accounts) {
      if (!data.subarray(0, 8).equals(VIRTUAL_POOL_DISCRIMINATOR)) continue
      if (data.readUInt8(IS_MIGRATED_OFFSET) !== 0) continue
      api.add(quoteMint, data.readBigUInt64LE(QUOTE_RESERVE_OFFSET).toString())
    }
  }
}

module.exports = {
  timetravel: false,
  methodology: 'TVL is the SOL held as quote reserve inside every active bonding curve launched through Archade. Each coin launched on Archade trades on its own bonding curve: buyers deposit SOL into the curve and sellers withdraw from it, so the curve reserve is the value locked. Curves that have migrated to a DEX pool are excluded because their liquidity has left the curve. Trading fees accrued to Archade, creators and partners are not counted.',
  solana: { tvl },
}
