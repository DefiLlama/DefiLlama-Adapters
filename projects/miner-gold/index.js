const ADDRESSES = require('../helper/coreAssets.json')
const { getConnection } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

// MINER (miner.tools): proof-of-work mining token on Solana. Miners can
// lock $MINER in program-owned lock vaults (lock-to-boost) for a mining
// weight multiplier; the locked tokens are the protocol TVL.
const MINER_PROGRAM = 'FyTBuifdJ1u3rF2bsK2NmjzogkCbNK3KtFfZyM3CUfv1'
// Lock PDA: discriminator u64 (=6) + authority [u8;32] + amount u64 +
// unlock_ts i64 + multiplier_bps u64 + bump u64 = 72 bytes. The amount
// field mirrors the lock vault balance exactly.
const LOCK_SIZE = 72
const LOCK_DISCRIMINATOR_B58 = '21D35quxec7' // u64 LE 6
const LOCK_AMOUNT_OFFSET = 40

// $MINER is not covered by the llama price feed yet, so the locked
// amount is converted to SOL through the canonical MINER/WSOL pool
// (Meteora DAMM v2 aka cp-amm; the same pool the program itself reads
// as its price oracle). Both mints have 9 decimals, so the spot price
// in lamports per native unit is simply (sqrt_price / 2^64)^2.
const POOL = 'CvLcJ8ypG6iikSjFdtkA8LXrbhN8SSyUdUvhbEBhmyGR'
const SQRT_PRICE_OFFSET = 456

async function tvl(api) {
  const connection = getConnection()
  const accounts = await connection.getProgramAccounts(new PublicKey(MINER_PROGRAM), {
    filters: [
      { dataSize: LOCK_SIZE },
      { memcmp: { offset: 0, bytes: LOCK_DISCRIMINATOR_B58 } },
    ],
    dataSlice: { offset: LOCK_AMOUNT_OFFSET, length: 8 },
  })
  let lockedNative = 0n
  accounts.forEach(({ account }) => { lockedNative += account.data.readBigUInt64LE(0) })

  const pool = await connection.getAccountInfo(new PublicKey(POOL))
  const sqrtPrice = pool.data.readBigUInt64LE(SQRT_PRICE_OFFSET)
    + (pool.data.readBigUInt64LE(SQRT_PRICE_OFFSET + 8) << 64n)
  const solPerMiner = Number(sqrtPrice) / 2 ** 64
  const lamports = Number(lockedNative) * solPerMiner * solPerMiner

  api.add(ADDRESSES.solana.SOL, Math.round(lamports))
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the $MINER locked in program-owned lock vaults (lock-to-boost): miners lock tokens for 7/30/90 days for a mining weight multiplier. Each lock account mirrors its vault balance on-chain; the amount is valued in SOL through the canonical MINER/WSOL pool spot price.',
  solana: { tvl },
}
