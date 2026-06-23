const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2 } = require("../helper/solana");

const PROGRAM_ID = "gLHaGJsZ6G7AXZxoDL9EsSWkRbKAWhFHi73gVfNXuzK";
const TOKEN_2022_PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

// SPT token mint - your native token
const SPT_MINT = "6uUU2z5GBasaxnkcqiQVHa2SXL68mAXDsq1zYN5Qxrm7";

const TOKEN_MINT_OFFSET = 40;
const STAKING_VAULT_OFFSET = 80;

async function getVaultData() {
  const connection = getConnection();
  
  const accounts = await connection.getProgramAccounts(
    new PublicKey(PROGRAM_ID),
    {
      filters: [
        { dataSize: 379 }
      ]
    }
  );
  
  const sptVaults = { spl: [], token2022: [] };
  const otherVaults = { spl: [], token2022: [] };
  
  for (const { account } of accounts) {
    const data = account.data;
    const tokenMint = new PublicKey(data.slice(TOKEN_MINT_OFFSET, TOKEN_MINT_OFFSET + 32));
    const stakingVault = new PublicKey(data.slice(STAKING_VAULT_OFFSET, STAKING_VAULT_OFFSET + 32));
    
    const isSPT = tokenMint.toString() === SPT_MINT;
    const targetVaults = isSPT ? sptVaults : otherVaults;
    
    const vaultInfo = await connection.getAccountInfo(stakingVault);
    if (vaultInfo && vaultInfo.owner.toString() === TOKEN_2022_PROGRAM) {
      targetVaults.token2022.push({
        mint: tokenMint.toString(),
        balance: Number(vaultInfo.data.readBigUInt64LE(64))
      });
    } else {
      targetVaults.spl.push(stakingVault.toString());
    }
  }
  
  return { sptVaults, otherVaults };
}

async function buildBalances(vaults) {
  const balances = await sumTokens2({ tokenAccounts: vaults.spl });
  
  for (const { mint, balance } of vaults.token2022) {
    const mintKey = `solana:${mint}`;
    if (!balances[mintKey]) balances[mintKey] = 0;
    balances[mintKey] += balance;
  }
  
  return balances;
}

async function staking() {
  const { sptVaults } = await getVaultData();
  return buildBalances(sptVaults);
}

async function tvl() {
  const { otherVaults } = await getVaultData();
  return buildBalances(otherVaults);
}

module.exports = {
  timetravel: false,
  solana: { 
    tvl,
    staking 
  },
  methodology: "TVL includes external tokens (USDC, SOL, etc.) in staking vaults. Staking represents SPT tokens locked in the protocol."
};