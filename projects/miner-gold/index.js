const { getConnection, sumTokens2 } = require('../helper/solana')
const { PublicKey } = require('@solana/web3.js')

const MINER_PROGRAM = 'FyTBuifdJ1u3rF2bsK2NmjzogkCbNK3KtFfZyM3CUfv1'
const MINER_MINT = 'GNuooA9WSTDazufDHksrdkspCieoxBERuWNUewkMbyzG'
// Lock PDA: discriminator u64 (=6) + authority [u8;32] + amount u64 + unlock_ts i64 +
// multiplier_bps u64 + bump u64 = 72 bytes. Each lock PDA is the authority of a vault
// token account that custodies the locked $MINER.
const LOCK_SIZE = 72
const LOCK_DISCRIMINATOR_B58 = '21D35quxec7' // u64 LE 6

async function staking(api) {
  const connection = getConnection()
  const locks = await connection.getProgramAccounts(new PublicKey(MINER_PROGRAM), {
    filters: [
      { dataSize: LOCK_SIZE },
      { memcmp: { offset: 0, bytes: LOCK_DISCRIMINATOR_B58 } },
    ],
    dataSlice: { offset: 0, length: 0 },
  })
  const owners = locks.map(l => l.pubkey.toString())
  return sumTokens2({ api, owners, tokens: [MINER_MINT] })
}

module.exports = {
  timetravel: false,
  methodology: 'Staking is the $MINER locked in program-owned lock vaults (lock-to-boost): miners lock tokens for 7/30/90 days for a mining weight multiplier. Lock vaults are discovered from the MINER program and their $MINER balances are summed on-chain.',
  solana: { tvl: () => ({}), staking },
}
