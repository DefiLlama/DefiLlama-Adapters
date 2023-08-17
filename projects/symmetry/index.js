const { getConnection, sumTokens2 } = require("../helper/solana");
const { PublicKey } = require('@solana/web3.js')
const FUNDS_VAULT = 'BLBYiq48WcLQ5SxiftyKmPtmsZPUBEnDEjqEnKGAR4zx'
const TOKEN_PROGRAM_ID = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";

async function fetch() {
  const connection = getConnection();
  const filters = [
    {
      dataSize: 165,
    },
    {
      memcmp: {
        offset: 32,
        bytes: FUNDS_VAULT,
      }            
    }
  ];
    const accounts = await connection.getParsedProgramAccounts(
      new PublicKey(TOKEN_PROGRAM_ID),
      {filters: filters}
  )  
  let balances = {};
  let tokenAccounts = [];
  accounts.forEach((account, i) => {
      const parsedAccountInfo = account.account.data;
      const mintAddress = parsedAccountInfo["parsed"]["info"]["mint"];
      const tokenBalance = parsedAccountInfo["parsed"]["info"]["tokenAmount"]["uiAmount"];
      tokenAccounts.push(account.pubkey.toString());
      balances[mintAddress] = tokenBalance;
  });
  let sum = await sumTokens2({ tokenAccounts })
  return sum;
}

module.exports = {
  timetravel: false,
  solana: {
    tvl: fetch
  },
};