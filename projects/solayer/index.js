const { sumTokens2, getConnection, } = require("../helper/solana");
const { PublicKey } = require("@solana/web3.js");
const ADDRESSES = require('../helper/coreAssets.json')

async function tvl(api) {
  const connection = getConnection();

  // add SOL staking
  const stakeAccount = await connection.getAccountInfo(new PublicKey('po1osKDWYF9oiVEGmzKA4eTs8eMveFRMox3bUKazGN2'))
  api.add(ADDRESSES.solana.SOL, Number(stakeAccount.data.readBigUint64LE(258)))

  // get LST details
  const data = await connection.getProgramAccounts(new PublicKey('sSo1iU21jBrU9VaJ8PJib1MtorefUV4fzC9GURa2KNn'), {
    filters: [{ dataSize: 74, },],
  })
  const tokensAndOwners = data.map((i) => {
    const offset = 8
    const lstMint = new PublicKey(i.account.data.slice(offset + 0, offset + 32));
    return [lstMint.toString(), i.pubkey.toString()]
  })

  // add SUSD Backing
  tokensAndOwners.push(
    ['4MmJVdwYN8LwvbGeCowYjSx7KoEi6BJWg8XXnW4fDDp6', 'FhVcYNEe58SMtxpZGnTu2kpYJrTu2vwCZDGpPLqbd2yG'],
    [ADDRESSES.solana.USDC, 'FhVcYNEe58SMtxpZGnTu2kpYJrTu2vwCZDGpPLqbd2yG'],
  )

  return sumTokens2({
    balances: api.getBalances(), tokensAndOwners, blacklistedTokens: [
      'sSo1wxKKr6zW2hqf5hZrp2CawLibcwi1pMBqk5bg2G4',
      'testqcAoCvfFpuFNtdmrBnBMSfFoXKkSTJ3ky6cPKjx',
    ]
  })
}

module.exports = {
  timetravel: false,
  methodology: "TVL is calculated by summing all re-staked assets.",
  solana: { tvl },
};
