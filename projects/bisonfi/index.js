const { PublicKey } = require('@solana/web3.js')
const { getConnection, sumTokens2 } = require('../helper/solana')

const PROGRAM_ID = new PublicKey(
  'BiSoNHVpsVZW2F7rx2eQ59yQwKxzU5NvBcmKshCSUypi'
)

// Base58 encoding of the 8-byte ASCII discriminator `POOLSTAT`.
const POOL_STATE_DISCRIMINATOR = 'ES78ZeanFtP'

// The two vault public keys are stored consecutively in each pool state:
// token vault 0 at bytes 120-151 and token vault 1 at bytes 152-183.
const VAULTS_OFFSET = 120
const VAULTS_LENGTH = 64

async function tvl(api) {
  const poolStates = await getConnection().getProgramAccounts(PROGRAM_ID, {
    filters: [
      { memcmp: { offset: 0, bytes: POOL_STATE_DISCRIMINATOR } },
    ],
    dataSlice: {
      offset: VAULTS_OFFSET,
      length: VAULTS_LENGTH,
    },
  })

  const tokenAccounts = poolStates.flatMap(({ account }) => [
    new PublicKey(account.data.subarray(0, 32)).toBase58(),
    new PublicKey(account.data.subarray(32, 64)).toBase58(),
  ])

  return sumTokens2({ api, tokenAccounts })
}

module.exports = {
  methodology:
    'TVL is the value of the two SPL Token or Token-2022 vaults recorded in every BisonFi pool-state account. Pool states are discovered on-chain from the BisonFi program using their POOLSTAT discriminator, so newly created pools are included automatically.',
  timetravel: false,
  solana: { tvl },
}
