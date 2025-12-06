const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2 } = require("../helper/solana");

const PROGRAM_ID = "gLHaGJsZ6G7AXZxoDL9EsSWkRbKAWhFHi73gVfNXuzK";
const TOKEN_2022_PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

const TOKEN_MINT_OFFSET = 40;
const STAKING_VAULT_OFFSET = 80;

async function tvl() {
  const connection = getConnection();
  
  const accounts = await connection.getProgramAccounts(
    new PublicKey(PROGRAM_ID),
    {
      filters: [
        { dataSize: 379 }
      ]
    }
  );
  
  const splTokenAccounts = [];
  const token2022Accounts = [];
  
  for (const { account } of accounts) {
    const data = account.data;
    const tokenMint = new PublicKey(data.slice(TOKEN_MINT_OFFSET, TOKEN_MINT_OFFSET + 32));
    const stakingVault = new PublicKey(data.slice(STAKING_VAULT_OFFSET, STAKING_VAULT_OFFSET + 32));
    
    const vaultInfo = await connection.getAccountInfo(stakingVault);
    if (vaultInfo && vaultInfo.owner.toString() === TOKEN_2022_PROGRAM) {
      token2022Accounts.push({
        mint: tokenMint.toString(),
        balance: Number(vaultInfo.data.readBigUInt64LE(64))
      });
    } else {
      splTokenAccounts.push(stakingVault.toString());
    }
  }
  
  const balances = await sumTokens2({ tokenAccounts: splTokenAccounts });
  
  for (const { mint, balance } of token2022Accounts) {
    const mintKey = `solana:${mint}`;
    if (!balances[mintKey]) balances[mintKey] = 0;
    balances[mintKey] += balance;
  }
  
  return balances;
}

module.exports = {
  timetravel: false,
  solana: { tvl },
  methodology: "TVL is calculated by summing all tokens held in StakePoint staking vaults across all pools, including Token-2022 assets."
};
