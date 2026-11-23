const { sumTokensExport } = require('../helper/solana')

// USDC account of the Bust vault (program BVYJzfEnjGqmrkqn6mzAfsUToJjmrkqt8TNEhK5wddiw, vault PDA Hj5Kh3RCTNTaCuvdhBY22HuGuS3K967qvn9GhZ3zn27Q)
const VAULT_USDC = 'E9X2E43n3ad2uQjuQsdnd5uFYXoWTMDS9sZTY3Tee64h'
// $BUST account of the stake pool (PDA 5WbABXxurCUqYkFiJo8rC7rJkKd3K9VrcqngY4t2ATVm)
const STAKE_POOL_BUST = 'JEK7DSt2hLqnmhysDDvBHh3TnM8w1pEbfsv2mZKam4rw'

module.exports = {
  timetravel: false,
  methodology: 'TVL is the USDC held by the Bust vault: the house liquidity that takes the other side of every trade, traders\' deposited balances and their open margins. Staking is the $BUST held by the stake pool.',
  solana: {
    tvl: sumTokensExport({ tokenAccounts: [VAULT_USDC] }),
    staking: sumTokensExport({ tokenAccounts: [STAKE_POOL_BUST] }),
  },
}
