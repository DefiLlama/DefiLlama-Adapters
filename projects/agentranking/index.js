/**
 * DefiLlama TVL adapter — AgentRanking Launchpad
 *
 * Chains:
 *  - solana: SOL in Pump.fun bonding curves for AgentRanking launches
 *  - robinhood: WETH in Uniswap V3 pools for AgentRanking launches
 *
 * Branding: AgentRanking / Robinhood Chain only.
 */

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/solana')
const { getConfig } = require('../helper/cache')

const EXPORT_URL = 'https://agentranking.io/api/public/defillama/launches'

const ROBINHOOD_WETH = ADDRESSES.robinhood?.WETH || '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'

async function loadExport() {
  return getConfig('agentranking-launch-tvl', EXPORT_URL)
}

async function solanaTvl(api) {
  const data = await loadExport()
  const owners = data?.chains?.solana?.bondingCurves
  if (!Array.isArray(owners) || owners.length === 0) return {}
  return sumTokens2({
    api,
    solOwners: owners,
    allowError: true,
  })
}

async function robinhoodTvl(api) {
  const data = await loadExport()
  const pools = data?.chains?.robinhoodchain?.pools
  const weth = data?.chains?.robinhoodchain?.weth || ROBINHOOD_WETH
  if (!Array.isArray(pools) || pools.length === 0) return {}
  return api.sumTokens({
    owners: pools,
    tokens: [weth],
  })
}

module.exports = {
  timetravel: false,
  misrepresentedTokens: false,
  methodology:
    'Solana TVL is SOL locked in Pump.fun bonding-curve accounts for AgentRanking-indexed mainnet launches. Robinhood Chain TVL is WETH held in Uniswap V3 pools created by the AgentRanking launch factory.',
  solana: { tvl: solanaTvl },
  // DefiLlama chain key (matches NOXA / coreAssets): "robinhood"
  robinhood: { tvl: robinhoodTvl },
}
