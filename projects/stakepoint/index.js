const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2 } = require("../helper/solana");

const PROGRAM_ID = "gLHaGJsZ6G7AXZxoDL9EsSWkRbKAWhFHi73gVfNXuzK";
const TOKEN_2022_PROGRAM = "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb";

const SPT_MINT = "6uUU2z5GBasaxnkcqiQVHa2SXL68mAXDsq1zYN5Qxrm7";

const TOKEN_MINT_OFFSET = 40;
const STAKING_VAULT_OFFSET = 80;

const { getConfig } = require("../helper/cache");

async function unwrapRaydiumLP(lpMint, lpBalance) {
  const json = await getConfig("raydium/lp/" + lpMint, `https://api-v3.raydium.io/pools/info/lps?lps=${lpMint}`);
  const pool = json?.data?.[0];

  if (!pool || pool.lpMint?.address !== lpMint) return null;

  const lpSupplyRaw = pool.lpAmount * Math.pow(10, pool.lpMint.decimals || 9);
  if (lpSupplyRaw === 0) return null;

  const share = lpBalance / lpSupplyRaw;

  return {
    mintA: pool.mintA.address,
    mintB: pool.mintB.address,
    amountA: Math.floor(pool.mintAmountA * Math.pow(10, pool.mintA.decimals) * share),
    amountB: Math.floor(pool.mintAmountB * Math.pow(10, pool.mintB.decimals) * share),
  };
}

async function getVaultData() {
  const connection = getConnection();
  
  const accounts = await connection.getProgramAccounts(
    new PublicKey(PROGRAM_ID),
    { filters: [{ dataSize: 379 }] }
  );
  
  const sptVaults = { spl: [], token2022: [] };
  const otherVaults = { spl: [], token2022: [] };
  const lpTokens = [];
  
  for (const { account } of accounts) {
    const data = account.data;
    const tokenMint = new PublicKey(data.slice(TOKEN_MINT_OFFSET, TOKEN_MINT_OFFSET + 32));
    const stakingVault = new PublicKey(data.slice(STAKING_VAULT_OFFSET, STAKING_VAULT_OFFSET + 32));
    
    const vaultInfo = await connection.getAccountInfo(stakingVault);
    if (!vaultInfo) continue;

    const balance = Number(vaultInfo.data.readBigUInt64LE(64));
    if (balance === 0) continue;

    const mintStr = tokenMint.toString();

    // Try unwrapping as Raydium LP
    const unwrapped = await unwrapRaydiumLP(mintStr, balance);

    if (unwrapped) {
      lpTokens.push({ [unwrapped.mintA]: unwrapped.amountA, [unwrapped.mintB]: unwrapped.amountB });
      continue;
    }

    const isSPT = mintStr === SPT_MINT;
    const targetVaults = isSPT ? sptVaults : otherVaults;
    
    if (vaultInfo.owner.toString() === TOKEN_2022_PROGRAM) {
      targetVaults.token2022.push({ mint: mintStr, balance });
    } else {
      targetVaults.spl.push(stakingVault.toString());
    }
  }
  
  return { sptVaults, otherVaults, lpTokens };
}

async function buildBalances(vaults, lpTokens) {
  const balances = await sumTokens2({ tokenAccounts: vaults.spl });
  
  for (const { mint, balance } of vaults.token2022) {
    const mintKey = `solana:${mint}`;
    if (!balances[mintKey]) balances[mintKey] = 0;
    balances[mintKey] += balance;
  }

  if (lpTokens) {
    for (const lp of lpTokens) {
      for (const [mint, amount] of Object.entries(lp)) {
        const key = `solana:${mint}`;
        if (!balances[key]) balances[key] = 0;
        balances[key] += amount;
      }
    }
  }
  
  return balances;
}

async function staking() {
  const { sptVaults } = await getVaultData();
  return buildBalances(sptVaults);
}

async function tvl() {
  const { otherVaults, lpTokens } = await getVaultData();
  return buildBalances(otherVaults, lpTokens);
}

module.exports = {
  timetravel: false,
  solana: { 
    tvl,
    staking 
  },
  methodology: "TVL includes all tokens in StakePoint staking vaults and locked LP tokens (unwrapped to underlying assets), including Token-2022 assets."
};