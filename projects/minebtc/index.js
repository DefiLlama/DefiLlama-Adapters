const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2, getTokenAccountBalances } = require("../helper/solana");
const ADDRESSES = require("../helper/coreAssets.json");

// MineBTC Program: 1eotiTH2UxCpPMmtzUDGqf1b8dwM7AMKb8a2Tio51an
const DBTC_MINT = "CtAu3kc8cQ1jcDMmRTBsDHoPuE3sswCagQ3BuqFDC6dt";

// --- Raydium CP-Swap Pool (dBTC/SOL) ---
const RAYDIUM_POOL_STATE = "F87M4sT6Wtfk4enVVbtM4ZnWsqCE9TXzL12Apwj3Cjtj";
const POOL_TOKEN0_VAULT = "EMDuS9XZesBDo8urJzwgrKC7qJrLQ6hHXVvSLNE6s3ui"; // SOL vault (9 decimals)
const POOL_TOKEN1_VAULT = "79nGAzP7D7GvHe4bPPs4DBHHGXspqE16Kn3w5e9QHEQw"; // dBTC vault (6 decimals)
const LP_SUPPLY_OFFSET = 333; // u64 LE offset for lp_supply in Raydium CP-Swap PoolState

// --- Token Vaults ---
const STAKED_DBTC_CUSTODIAN = "HXVe2xLchtKV332QKyh2kRJ6dQf3XxbhsnLGQu4bfLM9";
const STAKED_LP_CUSTODIAN = "EJ7ZomjToiB68rNFRa83wrBD11rvmDEa29PbJ4ct8ciW";

// --- SOL Vaults ---
const SOL_PRIZE_POT = "AMuDuGgeWtmT3b7QPCAqQTducxV1Z2s6GjDY2gwGE91C";
const COUNTRY_RACE_SOL_VAULT = "DRnKgn51Mm7t1UneFD6Je5B6XLWmFt9gBdJN5xPcXfMB";
const STAKER_SOL_REWARD_VAULT = "FYnbbqMPUetvN22CDeDxAJb4SSXmqZcGEbrwVvoJREvK";
const FACTION_TREASURY_VAULT = "1gYoc7ojYQdkABsAVFnFQhmYphe532EDnxheRZBDuqr";

async function getStakedLpUnderlyingValue(api) {
  const connection = getConnection();

  // Get staked LP balance, pool vault reserves, and pool state (for total lp_supply) in parallel
  const [stakedLpInfo, poolVaultBalances, poolStateAccount] = await Promise.all([
    getTokenAccountBalances([STAKED_LP_CUSTODIAN], { individual: true, allowError: true }),
    getTokenAccountBalances([POOL_TOKEN0_VAULT, POOL_TOKEN1_VAULT], { individual: true, allowError: true }),
    connection.getAccountInfo(new PublicKey(RAYDIUM_POOL_STATE)),
  ]);

  const stakedLp = stakedLpInfo.length > 0 ? Number(stakedLpInfo[0].amount) : 0;
  if (stakedLp === 0) return;

  // Read lp_supply from pool state account (total LP ever minted, includes burned)
  // LP tokens are burned for permanent liquidity — mint supply shows 0 but pool tracks total
  if (!poolStateAccount || !poolStateAccount.data) return;
  const lpTotalSupply = Number(poolStateAccount.data.readBigUInt64LE(LP_SUPPLY_OFFSET));
  if (lpTotalSupply === 0) return;

  // Get pool vault reserves (raw amounts)
  const solInPool = poolVaultBalances.length >= 1 ? Number(poolVaultBalances[0].amount) : 0;
  const dbtcInPool = poolVaultBalances.length >= 2 ? Number(poolVaultBalances[1].amount) : 0;

  // Calculate pro-rata share of underlying tokens for staked LP
  const share = stakedLp / lpTotalSupply;
  const underlyingSol = Math.floor(solInPool * share);
  const underlyingDbtc = Math.floor(dbtcInPool * share);

  if (underlyingSol > 0) api.add(ADDRESSES.solana.SOL, underlyingSol);
  if (underlyingDbtc > 0) api.add(DBTC_MINT, underlyingDbtc);
}

async function tvl(api) {
  // User reward pools funded by gameplay and tax cranks.
  await sumTokens2({
    api,
    solOwners: [SOL_PRIZE_POT, COUNTRY_RACE_SOL_VAULT, STAKER_SOL_REWARD_VAULT],
    tokenAccounts: [FACTION_TREASURY_VAULT],
  });
}

async function staking(api) {
  // Staked dBTC (protocol's own token)
  await sumTokens2({
    api,
    tokenAccounts: [STAKED_DBTC_CUSTODIAN],
  });
}

async function pool2(api) {
  // Staked LP (dBTC/SOL) -> pro-rata underlying value
  await getStakedLpUnderlyingValue(api);
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL includes SOL in the Casino prize pot, Country Race reward vault, staking reward vault, and dBTC in the faction-tax reward vault. Staking tracks user-staked dBTC. Pool2 tracks staked dBTC/SOL LP tokens valued by their pro-rata share of underlying assets in the Raydium pool.",
  solana: {
    tvl,
    staking,
    pool2,
  },
};
