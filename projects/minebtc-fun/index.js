const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2, getTokenAccountBalances } = require("../helper/solana");
const ADDRESSES = require("../helper/coreAssets.json");

// MineBTC Program: 1eotiTH2UxCpPMmtzUDGqf1b8dwM7AMKb8a2Tio51an
const DBTC_MINT = "CtAu3kc8cQ1jcDMmRTBsDHoPuE3sswCagQ3BuqFDC6dt";

// Raydium CP-Swap Pool (dBTC/SOL)
const RAYDIUM_POOL_STATE = "F87M4sT6Wtfk4enVVbtM4ZnWsqCE9TXzL12Apwj3Cjtj";
const POOL_TOKEN0_VAULT = "EMDuS9XZesBDo8urJzwgrKC7qJrLQ6hHXVvSLNE6s3ui";
const POOL_TOKEN1_VAULT = "79nGAzP7D7GvHe4bPPs4DBHHGXspqE16Kn3w5e9QHEQw";
const LP_SUPPLY_OFFSET = 333;

// Staking custodians
const STAKED_DBTC_CUSTODIAN = "HXVe2xLchtKV332QKyh2kRJ6dQf3XxbhsnLGQu4bfLM9";
const STAKED_LP_CUSTODIAN = "EJ7ZomjToiB68rNFRa83wrBD11rvmDEa29PbJ4ct8ciW";

// Gameplay reward vaults
const SOL_PRIZE_POT = "AMuDuGgeWtmT3b7QPCAqQTducxV1Z2s6GjDY2gwGE91C";
const COUNTRY_RACE_SOL_VAULT = "DRnKgn51Mm7t1UneFD6Je5B6XLWmFt9gBdJN5xPcXfMB";
const STAKER_SOL_REWARD_VAULT = "FYnbbqMPUetvN22CDeDxAJb4SSXmqZcGEbrwVvoJREvK";
const FACTION_TREASURY_VAULT = "1gYoc7ojYQdkABsAVFnFQhmYphe532EDnxheRZBDuqr";

/**
 * Adds the underlying SOL and dBTC value for MineBTC LP tokens staked in the
 * protocol custodian, using Raydium CP-Swap pool reserves and tracked LP supply.
 *
 * @param {object} api DefiLlama chain API accumulator.
 */
async function getStakedLpUnderlyingValue(api) {
  const connection = getConnection();

  const [stakedLpInfo, poolVaultBalances, poolStateAccount] = await Promise.all([
    getTokenAccountBalances([STAKED_LP_CUSTODIAN], { individual: true, allowError: true }),
    getTokenAccountBalances([POOL_TOKEN0_VAULT, POOL_TOKEN1_VAULT], { individual: true, allowError: true }),
    connection.getAccountInfo(new PublicKey(RAYDIUM_POOL_STATE)),
  ]);

  const stakedLp = stakedLpInfo.length > 0 ? BigInt(stakedLpInfo[0].amount) : 0n;
  if (stakedLp === 0n) return;

  if (!poolStateAccount || !poolStateAccount.data) return;
  const lpTotalSupply = poolStateAccount.data.readBigUInt64LE(LP_SUPPLY_OFFSET);
  if (lpTotalSupply === 0n) return;

  const solInPool = poolVaultBalances.length >= 1 ? BigInt(poolVaultBalances[0].amount) : 0n;
  const dbtcInPool = poolVaultBalances.length >= 2 ? BigInt(poolVaultBalances[1].amount) : 0n;

  const underlyingSol = (solInPool * stakedLp) / lpTotalSupply;
  const underlyingDbtc = (dbtcInPool * stakedLp) / lpTotalSupply;

  if (underlyingSol > 0n) api.add(ADDRESSES.solana.SOL, underlyingSol.toString());
  if (underlyingDbtc > 0n) api.add(DBTC_MINT, underlyingDbtc.toString());
}

/**
 * Tracks MineBTC gameplay reward inventory held in protocol-controlled vaults.
 *
 * @param {object} api DefiLlama chain API accumulator.
 */
async function tvl(api) {
  await sumTokens2({
    api,
    solOwners: [SOL_PRIZE_POT, COUNTRY_RACE_SOL_VAULT, STAKER_SOL_REWARD_VAULT],
    tokenAccounts: [FACTION_TREASURY_VAULT],
  });
}

/**
 * Tracks user-staked dBTC held by the global staking custodian.
 *
 * @param {object} api DefiLlama chain API accumulator.
 */
async function staking(api) {
  await sumTokens2({
    api,
    tokenAccounts: [STAKED_DBTC_CUSTODIAN],
  });
}

/**
 * Tracks user-staked dBTC/SOL LP exposure by adding the LP custodian's
 * pro-rata underlying pool reserves.
 *
 * @param {object} api DefiLlama chain API accumulator.
 */
async function pool2(api) {
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
