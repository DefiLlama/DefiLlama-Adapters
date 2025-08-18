const { getConfig } = require('../helper/cache');
const { sumTokens2 } = require('../helper/unwrapLPs');

const chains = ["ethereum", "polygon", "base", "bsc", "arbitrum"]

// Calculate vault balances for all vaults on a specific chain holding any token
async function tvl(api) {

  // Get all indexed server-side data
  const protocolTVLReply = await getConfig('tradingstrategy-ai', 'https://tradingstrategy.ai/strategies/tvl')
  const enzymeVaults = Object.values(protocolTVLReply.strategies).filter((strat) => strat.asset_management_mode === 'enzyme' && strat.chain_id == api.chainId).map(i => i.address)
  const otherVaults = Object.values(protocolTVLReply.strategies).filter((strat) => strat.asset_management_mode !== 'enzyme' && strat.chain_id == api.chainId).map(i => i.address)
  await sumTokens2({ api, owners: otherVaults, fetchCoValentTokens: true, })
  const tokens = await api.multiCall({ abi: 'address[]:getTrackedAssets', calls: enzymeVaults })
  return sumTokens2({ ownerTokens: tokens.map((t, i) => [t, enzymeVaults[i]]), api })
}


chains.forEach(chain => module.exports[chain] = { tvl })