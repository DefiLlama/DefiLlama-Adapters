const { PublicKey } = require('@solana/web3.js')
const { sumTokens2, getConnection } = require('../helper/solana')

const UMBRA_PROGRAM = 'UMBRAD2ishebJTcgCLkTkNUx1v3GyoAgpTRPeWoLykh'
const POOL_ACCOUNT_SIZE = 176
const POOL_DISCRIMINATOR = 'JGBg3fpzoEY'

async function getPoolOwners() {
  const accounts = await getConnection().getProgramAccounts(new PublicKey(UMBRA_PROGRAM), {
    filters: [{ dataSize: POOL_ACCOUNT_SIZE }, { memcmp: { offset: 0, bytes: POOL_DISCRIMINATOR } }],
    dataSlice: { offset: 0, length: 0 },
  })
  return accounts.map(a => a.pubkey.toString())
}

async function tvl(api) {
  const owners = await getPoolOwners()
  // UMBRA is counted like every other pooled token: it is shielded by users to hold and
  // transact privately, with no lockup, rewards or governance attached
  return sumTokens2({ api, owners })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the sum of the SPL token balances held in the token account of each Umbra shielded pool on Solana, read directly from chain state. Every pool custodies user deposits in a single token account owned by the pool PDA, so the balance of that account is the pool\'s outstanding deposits. Nothing is borrowed, lent or rehypothecated by Umbra itself. The UMBRA pool is an ordinary shielded pool (no lockup, rewards or governance), so it is counted like every other pool.',
  solana: { tvl },
}
