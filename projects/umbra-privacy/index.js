const { PublicKey } = require('@solana/web3.js')
const { sumTokens2, getConnection } = require('../helper/solana')

// Umbra V1: one PDA per shielded pool, each owning that pool's token account
const UMBRA_PROGRAM = 'UMBRAD2ishebJTcgCLkTkNUx1v3GyoAgpTRPeWoLykh'
const POOL_ACCOUNT_SIZE = 176
const POOL_DISCRIMINATOR = 'JGBg3fpzoEY'

// Umbra V2 (program nimBUs55CbjkNfy8UvK48DqFTY7L2mdkmZMQC9mk6LK): a single vault authority PDA
// owns one token account per mint (SPL Token and Token-2022), and SOL is held unwrapped as
// lamports in one program-owned account
const V2_VAULT_AUTHORITY = '2sjnjABJHPEZS8oVdp8nztPBUVUAT7uJawc8eQTMHTfa'
const V2_SOL_VAULT = 'BxDCkvgZYRcCAnpywVw5j14AhkXehYvsXoCRiaodUs8s'

const UMBRA_MINT = 'PRVT6TB7uss3FrUd2D9xs2zqDBsa3GbMJMwCQsgmeta'

async function getPoolOwners() {
  const accounts = await getConnection().getProgramAccounts(new PublicKey(UMBRA_PROGRAM), {
    filters: [{ dataSize: POOL_ACCOUNT_SIZE }, { memcmp: { offset: 0, bytes: POOL_DISCRIMINATOR } }],
    dataSlice: { offset: 0, length: 0 },
  })
  return accounts.map(a => a.pubkey.toString()).concat(V2_VAULT_AUTHORITY)
}

async function tvl(api) {
  const owners = await getPoolOwners()
  return sumTokens2({ api, owners, solOwners: [V2_SOL_VAULT], blacklistedTokens: [UMBRA_MINT] })
}

async function staking(api) {
  const owners = await getPoolOwners()
  return sumTokens2({ api, tokensAndOwners: owners.map(owner => [UMBRA_MINT, owner]) })
}

module.exports = {
  timetravel: false,
  methodology:
    'TVL is the value of user deposits held in Umbra\'s shielded pools on Solana, read directly from chain state, across both versions. V1: every pool custodies deposits in a single token account owned by the pool PDA. V2: one vault authority PDA owns a token account per mint (SPL Token and Token-2022), and SOL deposits sit as lamports in a single program-owned vault account. Nothing is borrowed, lent or rehypothecated by Umbra itself. Umbra\'s own token is counted under staking where users have deposited it into a pool.',
  solana: { tvl, staking },
}
