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
  return sumTokens2({ api, owners })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the sum of the SPL token balances held in the token account of each Umbra shielded pool on Solana, read directly from chain state. Every pool custodies user deposits in a single token account owned by the pool PDA, so the balance of that account is the pool\'s outstanding deposits. The UMBRA pool is one of these shielded pools and is counted as TVL like any other: depositors shield UMBRA to break the on-chain link between deposit and withdrawal, exactly as they do with SOL or USDC. It pays no rewards, imposes no lockup and confers no governance rights, so it is not staking. Nothing is borrowed, lent or rehypothecated by Umbra itself.',
  solana: { tvl },
}
