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
  const tokenAccounts = data.map((i) => {i.pubkey.toString()})

  return sumTokens2({
    balances: api.getBalances(), 
    tokenAccounts, 
    blacklistedTokens: [
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
