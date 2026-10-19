const { PublicKey } = require('@solana/web3.js')
const { getConnection, getTokenAccountBalances } = require('../helper/solana')
const { transformDexBalances } = require('../helper/portedTokens')

// DeepSwap: DEEP's constant-product AMM, a fork of Raydium cp-swap (Apache-2.0) deployed
// under its own program id. Tokens that graduate from the DEEP launchpad get their pool here
// (the LP tokens of a graduation pool are burned); anyone can open a pool for any other pair.
const DEEP_AMM_PROGRAM = 'HCrCy6bzHhZ1b6bXwQAucEFkKXyzYMh3hgAR8UPrYSEP'

// Anchor discriminator of the account: sha256("account:PoolState")[0..8]
const POOL_STATE_DISCRIMINATOR = Buffer.from([247, 237, 227, 245, 215, 195, 222, 70])
const POOL_STATE_SIZE = 637

// PoolState layout (zero-copy, packed). Offsets from the start of the account.
const OFFSET_TOKEN_0_VAULT = 72
const OFFSET_TOKEN_1_VAULT = 104
const OFFSET_TOKEN_0_MINT = 168
const OFFSET_TOKEN_1_MINT = 200
// Fees that have accrued in the vaults but belong to the protocol or to the pool's reward
// recipient, not to the liquidity: u64 each, [token 0, token 1].
const OFFSETS_ACCRUED_FEES = [
  [341, 349], // protocol_fees_token_0 / _1
  [357, 365], // fund_fees_token_0 / _1
  [397, 405], // creator_fees_token_0 / _1
]
const SLICE_START = OFFSET_TOKEN_0_VAULT
const SLICE_LENGTH = 413 - SLICE_START

async function tvl(api) {
  const connection = getConnection()
  const pools = await connection.getProgramAccounts(new PublicKey(DEEP_AMM_PROGRAM), {
    filters: [
      { dataSize: POOL_STATE_SIZE },
      { memcmp: { offset: 0, bytes: POOL_STATE_DISCRIMINATOR.toString('base64'), encoding: 'base64' } },
    ],
    dataSlice: { offset: SLICE_START, length: SLICE_LENGTH },
  })
  if (!pools.length) return

  const readPubkey = (data, offset) => new PublicKey(data.subarray(offset - SLICE_START, offset - SLICE_START + 32)).toString()
  const readU64 = (data, offset) => data.readBigUInt64LE(offset - SLICE_START)

  const vaults = pools.flatMap(({ account }) => [
    readPubkey(account.data, OFFSET_TOKEN_0_VAULT),
    readPubkey(account.data, OFFSET_TOKEN_1_VAULT),
  ])
  const vaultBalances = await getTokenAccountBalances(vaults, { individual: true })

  const data = []
  pools.forEach(({ pubkey, account }, i) => {
    const reserves = [0, 1].map((side) => {
      const vault = vaultBalances[2 * i + side]
      if (vault?.amount === undefined) return null
      const accruedFees = OFFSETS_ACCRUED_FEES.reduce((sum, offsets) => sum + readU64(account.data, offsets[side]), 0n)
      const reserve = BigInt(vault.amount) - accruedFees
      return reserve < 0n ? null : reserve.toString()
    })
    // A pool whose vault could not be read, or that would owe more fees than its vault holds
    // (the program does not allow it), is left out instead of failing every other pool.
    if (reserves.includes(null)) {
      api.log(`deepswap: skipped pool ${pubkey}, its vault balances could not be used`)
      return
    }
    data.push({
      token0: readPubkey(account.data, OFFSET_TOKEN_0_MINT),
      token1: readPubkey(account.data, OFFSET_TOKEN_1_MINT),
      token0Bal: reserves[0],
      token1Bal: reserves[1],
    })
  })

  return transformDexBalances({ api, data })
}

module.exports = {
  timetravel: false, // getProgramAccounts reads the current state only
  methodology:
    'TVL is the liquidity in every DeepSwap pool: the balance of the pool\'s two token vaults minus the trading fees that have accrued in them for the protocol and for the pool\'s reward recipient. A pool that pairs a token with SOL or another major asset is valued at twice that side, since most tokens here have no market outside their own pool; a pool of two major assets counts both sides.',
  solana: { tvl },
}
