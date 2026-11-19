const { callSoroban, getContractInstanceStorage } = require('../helper/chain/stellar');

// Vaquita fixed-yield pool on Stellar mainnet. User principal is routed into a
// Vaquita-deployed and Vaquita-managed DeFindex vault; the reward pool that
// backs the fixed yield sits in the pool contract as idle deposit token.
const VAQUITA_POOL_STELLAR = 'CDTTAZ3NK4MMDHK2C3I6LRDT4YADJZ2QXINKLKQNZUVX7OTUKQNCQGC4';

async function stellarTvl(api) {
  // Read live config from instance storage so admin updates to the deposit
  // token / vault are picked up without an adapter change.
  const { BlendToken: token, DeFindexVaultAddress: vault } = await getContractInstanceStorage(VAQUITA_POOL_STELLAR);

  // Reward pool held directly by the pool contract, outside the vault.
  const idle = await callSoroban(token, 'balance', [VAQUITA_POOL_STELLAR]);
  api.add(token, idle);

  // The vault is a Vaquita product, so all of its deposits count, not just the
  // share of it held by the pool. total_amount covers idle + strategy-invested.
  const funds = await callSoroban(vault, 'fetch_total_managed_funds');
  for (const { asset, total_amount } of funds) {
    if (asset && total_amount != null) api.add(asset, total_amount.toString());
  }
}

module.exports = {
  // Soroban reads go through simulateTransaction, which only sees the current
  // ledger, so historical runs would report today's Stellar balances.
  timetravel: false,
  base: { tvl: () => ({} ) },
  stellar: { tvl: stellarTvl },
  methodology: 'On Stellar, TVL is the total assets managed by the Vaquita-deployed DeFindex vault (fetch_total_managed_funds, covering both idle and strategy-invested amounts), plus the idle deposit token balance held by the Vaquita pool contract to back the fixed-yield reward pool. The Base deployment was shut down on 2026-08-06 and is no longer counted.',
};
