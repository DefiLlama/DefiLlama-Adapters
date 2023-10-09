const { getConnection, sumTokens2, exportDexTVL } = require("../helper/chain/renec");
const { PublicKey } = require('@solana/web3.js')
const FUNDS_VAULT = 'BLBYiq48WcLQ5SxiftyKmPtmsZPUBEnDEjqEnKGAR4zx'
const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
const NEMOSWAP_PROGRAM_ID = "7rh7ZtPzHqdY82RWjHf1Q8NaQiWnyNqkC48vSixcBvad";

async function getTokenAccounts() {
  const programId = new PublicKey(NEMOSWAP_PROGRAM_ID);
  const connection = getConnection();
  console.log("Program id: ", programId.toBase58())
  const accounts = await connection.getProgramAccounts(programId, {
    filters: [{
      dataSize: 654
    }]
  });
  const tokenAccounts = []
  accounts.forEach(({ account: { data }}) => {
    // State: https://github.com/renec-chain/nemo-swap/blob/master/programs/whirlpool/src/state/whirlpool.rs
    let i = 8+ 1 + 32 + 1 + 2 * 4 + 16 * 2 + 4 + 8 * 2 + 32 // offset
    const tokenAccountA = new PublicKey(data.subarray(i, i+32)).toString()
    i += 32 + 16 + 32
    const tokenAccountB= new PublicKey(data.subarray(i, i+32)).toString()
    tokenAccounts.push(tokenAccountA, tokenAccountB)
  })
  return tokenAccounts
}


module.exports = {
  renec: {
    tvl:exportDexTVL(NEMOSWAP_PROGRAM_ID, getTokenAccounts)
  },
};