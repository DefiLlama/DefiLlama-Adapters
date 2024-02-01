const { getConnection, exportDexTVL } = require("../helper/solana");
const { PublicKey } = require('@solana/web3.js')

// State: https://github.com/renec-chain/nemo-swap/blob/master/programs/whirlpool/src/state/whirlpool.rs
const NEMOSWAP_PROGRAM_ID = "7rh7ZtPzHqdY82RWjHf1Q8NaQiWnyNqkC48vSixcBvad";
const WHIRLPOOL_DATA_SIZE = 654;
const TOKEN_ACCOUNT_A_OFFSET = 8 + 1 + 32 + 1 + 2 * 4 + 16 * 2 + 4 + 8 * 2 + 32;
const TOKEN_ACCOUNT_B_OFFSET = TOKEN_ACCOUNT_A_OFFSET + 32 + 16 + 32;
const PUBKEY_LENGTH=32;

async function getTokenAccounts(chain) {
  const programId = new PublicKey(NEMOSWAP_PROGRAM_ID);
  const connection = getConnection(chain);
  const accounts = await connection.getProgramAccounts(programId, {
    filters: [{
      dataSize: WHIRLPOOL_DATA_SIZE
    }]
  });

  const tokenAccounts = []
  accounts.forEach(({ account: { data }}) => {
    const tokenAccountA = new PublicKey(data.subarray(TOKEN_ACCOUNT_A_OFFSET, TOKEN_ACCOUNT_A_OFFSET + PUBKEY_LENGTH)).toString()
    const tokenAccountB= new PublicKey(data.subarray(TOKEN_ACCOUNT_B_OFFSET, TOKEN_ACCOUNT_B_OFFSET + PUBKEY_LENGTH)).toString()
    tokenAccounts.push(tokenAccountA, tokenAccountB)
  })
  return tokenAccounts
}


module.exports = {
  renec: {
    tvl: exportDexTVL(NEMOSWAP_PROGRAM_ID, getTokenAccounts, 'renec')
  },
};