const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/solana')

async function tvl() {
  const tokens = [
    ADDRESSES.solana.USDC,
    ADDRESSES.solana.SOL,
    ADDRESSES.solana.USDT,
    "7vfCXTUXx5WJV5JADk17DUJ4ksgau7utNKj4b963voxs",
    "9n4nbM75f5Ui33ZbPYXn59EwSgE8CGsHtAeTH5YFeJ9E",
    "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So",
    "9vMJfxuKxXBoEa7rM12mYLMwTacLMLDJqHozw96WQL8i",
  ]
  const owner = 'HjHSNe8hhvZ8hKCRrhKg1DGiGPd9NYQbUjT1SQRDo4kZ'

  return sumTokens2({ owner, tokens })
}
module.exports = {
  hallmarks:[
    [1667865600, "FTX collapse"]
  ],
  timetravel: false,
  solana: {
    tvl,
  },
  methodology: `To obtain the tvl we're getting the vault accounts information where user deposited collateral is stored.`,
}
