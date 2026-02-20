const { PublicKey } = require("@solana/web3.js");
const { getConnection, sumTokens2, getTokenAccountBalances } = require("../helper/solana");
const ADDRESSES = require("../helper/coreAssets.json");

// MineBTC Program: Hw9uxvtmQdS57N6aNwJA5iqjSqzhRDdopCHgm8EPwkqx
const DOGEBTC_MINT = "BwMCF5LSHPvrR8pLVvcsa4k1AMg4VWVnMWUiNEXMtLkE";

// --- Raydium CP-Swap Pool (DogeBTC/SOL) ---
const RAYDIUM_POOL_STATE = "HmPwHy2z9aQa2Ce2kMhwvjaiqCBiE7kdHppkUP6jZ7nf";
const POOL_TOKEN0_VAULT = "4YGosu8THGYPVToa8YttLe8kefNNhsc66wWScT9ZaDxc"; // SOL vault (9 decimals)
const POOL_TOKEN1_VAULT = "AnPauy18Yi2YCPiKcgg69mzrhSH6wVxvCNtvfe8gaxp";  // DogeBTC vault (6 decimals)
const LP_SUPPLY_OFFSET = 333; // u64 LE offset for lp_supply in Raydium CP-Swap PoolState

// --- Token Vaults ---
const STAKED_DOGEBTC_CUSTODIAN = "523EuRZDDyvCaVJGsqgcAuifcLiVvgAYynmjVWd1RXDR";
const STAKED_LP_CUSTODIAN = "Eyzfok5go6ddaKHEddVza5QTKzo4tcYF282cM1nU8GqV";
const FACTION_TREASURY_VAULT = "GUrrK4c1RmTDqYbEbWSjq6mfUcujpgTtasU4JXVzEKMA";
const NFT_FLOOR_SWEEP_VAULT = "DRvR4WpLj85Lfvwk3im7Ucrz1s9FPLPUtrTihUiqaPve";

// --- SOL Vaults ---
const SOL_PRIZE_POT = "GqMyratKThjEKzqZQStUy2LNB3dogZ3ETDBMQ33fmUw5";
const STAKER_SOL_REWARD_VAULT = "HiGNRiXWrqtFbwEH1YKQVHommFU15auksXbe7Qv7Nrrb";

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
  if (underlyingDbtc > 0) api.add(DOGEBTC_MINT, underlyingDbtc);
}

async function tvl(api) {
  // SOL in protocol vaults + faction/sweep DogeBTC vaults
  await sumTokens2({
    api,
    tokenAccounts: [
      FACTION_TREASURY_VAULT,
      NFT_FLOOR_SWEEP_VAULT,
    ],
    solOwners: [
      SOL_PRIZE_POT,
      STAKER_SOL_REWARD_VAULT,
    ],
  });

  return api.getBalances();
}

async function staking(api) {
  // Staked DogeBTC (protocol's own token)
  await sumTokens2({
    api,
    tokenAccounts: [STAKED_DOGEBTC_CUSTODIAN],
  });

  return api.getBalances();
}

async function pool2(api) {
  // Staked LP (DogeBTC/SOL) -> pro-rata underlying value
  await getStakedLpUnderlyingValue(api);

  return api.getBalances();
}

module.exports = {
  timetravel: false,
  methodology:
    "TVL includes SOL in betting prize pot and staker reward vault, DogeBTC in faction treasury and NFT floor sweep vaults. Staking tracks staked DogeBTC. Pool2 tracks staked DogeBTC/SOL LP tokens valued by their pro-rata share of underlying assets in the Raydium pool.",
  solana: {
    tvl,
    staking,
    pool2,
  },
};
