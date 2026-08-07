const { addToApi } = require('../helper/rujira/balances')
const { getBlock } = require('../helper/rujira/query')
const { getStakingBalances } = require('../helper/rujira/staking')

async function staking(api) {
  const height = await getBlock(api)
  addToApi(api, await getStakingBalances(height, 'x/ruji'))
}

async function tvl() {
  return {}
}

module.exports = {
  methodology:
    'Reports only legacy RUJI staking principal (account_bond plus liquid_bond_size) in the RUJI staking contract. Reward balances, liquid-bond shares, and RUJI held by other Rujira products are excluded.',
  thorchain: { tvl, staking },
}
