/**
 * DefiLlama TVL adapter — AgentRanking Launchpad
 *
 * Chains:
 *  - solana: SOL in Pump.fun bonding curves for AgentRanking launches
 *  - robinhood: WETH in Uniswap V3 pools for AgentRanking launches
 *
 * Copy this folder to DefiLlama/DefiLlama-Adapters/projects/agentranking/
 * then: node test.js projects/agentranking/index.js
 *
 * Branding: AgentRanking / Robinhood Chain only.
 */

const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/solana')
const { getConfig } = require('../helper/cache')

const EXPORT_URL = 'https://agentranking.io/api/public/defillama/launches'

const ROBINHOOD_WETH = ADDRESSES.robinhood?.WETH || '0x0Bd7D308f8E1639FAb988df18A8011f41EAcAD73'
const ROBINHOOD_FACTORY = '0xaA8Af274bba2b9dE53119CB117C8AC6A39e6F5Aa'
const ROBINHOOD_LP_LOCKER = '0x38daBB90C96eea7B90613ABbf019ABCe0808CF12'

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

module.exports._contracts = {
  robinhoodFactory: ROBINHOOD_FACTORY,
  robinhoodLpLocker: ROBINHOOD_LP_LOCKER,
  robinhoodWeth: ROBINHOOD_WETH,
  exportUrl: EXPORT_URL,
}
