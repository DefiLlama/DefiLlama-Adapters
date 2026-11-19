const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2, getMultipleAccounts } = require("../helper/solana");

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

// tvl and staking both need the same scan, so it runs once per process
let vaultDataPromise;
function getVaultData() {
  if (!vaultDataPromise) vaultDataPromise = fetchVaultData();
  return vaultDataPromise;
}

async function fetchVaultData() {
  const connection = getConnection();

  // only the token mint (40-72) and the staking vault (80-112) are read
  const accounts = await connection.getProgramAccounts(
    new PublicKey(PROGRAM_ID),
    {
      filters: [{ dataSize: 379 }],
      dataSlice: { offset: TOKEN_MINT_OFFSET, length: STAKING_VAULT_OFFSET + 32 - TOKEN_MINT_OFFSET },
    }
  );

  const sptVaults = { spl: [], token2022: [] };
  const otherVaults = { spl: [], token2022: [] };
  const lpTokens = [];

  const pools = accounts.map(({ account: { data } }) => ({
    tokenMint: new PublicKey(data.slice(0, 32)),
    stakingVault: new PublicKey(data.slice(STAKING_VAULT_OFFSET - TOKEN_MINT_OFFSET, STAKING_VAULT_OFFSET - TOKEN_MINT_OFFSET + 32)),
  }));
  // one batched read for every vault instead of a getAccountInfo per pool
  const vaultInfos = await getMultipleAccounts(pools.map(p => p.stakingVault));

  for (const [i, { tokenMint, stakingVault }] of pools.entries()) {
    const vaultInfo = vaultInfos[i];
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
    balances[mintKey] = Number(balances[mintKey] || 0) + balance;
  }

  if (lpTokens) {
    for (const lp of lpTokens) {
      for (const [mint, amount] of Object.entries(lp)) {
        const key = `solana:${mint}`;
        balances[key] = Number(balances[key] || 0) + amount;
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
  methodology: "TVL counts tokens held in StakePoint token locks, LP locks and staking pools. Locked and staked assets sit in Program Derived Addresses controlled by the StakePoint program, with no private keys, so they cannot be withdrawn before their unlock date. LP positions are unwrapped to their underlying assets. SPL and Token-2022 assets are both included, and SPT staking is reported separately under staking."
};
