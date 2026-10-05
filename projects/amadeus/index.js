const { get } = require('../helper/http')
const { getEnv } = require('../helper/env')

// Amadeus (https://ama.one), a privacy-oriented layer 1 for AI agents.
// TVL = the native AMA locked in validator LockupVaults, read from the chain's
// own node: GET /api/chain/stats.total_locked is the node's rollup of the
// `bic:lockup_vault:vault:*` contract state (consensus/bic/lockup_vault.rs),
// in whole AMA. The same node serves the vaults individually via
// POST /api/contract/get_prefix (vecpak-encoded); the rollup is what the
// Amahub validator board reads and the two agree to the token.
async function tvl() {
  const { error, stats } = await get(`${getEnv('AMADEUS_RPC')}/chain/stats`)
  if (error !== 'ok' || !stats || stats.total_locked == null) throw new Error('amadeus: chain/stats did not return total_locked')
  // AMA is not listed on CoinGecko yet (TGE pending): keyed under the chain so
  // it is reported as an unpriced balance until a price source exists.
  return { 'amadeus:AMA': Number(stats.total_locked) }
}

module.exports = {
  timetravel: false,
  methodology: 'AMA locked in validator LockupVaults on the Amadeus chain, read from the chain node (chain/stats.total_locked, the rollup of the LockupVault contract state). Unlocked balances, validator rewards and anything bridged elsewhere are not counted.',
  amadeus: { tvl },
}
