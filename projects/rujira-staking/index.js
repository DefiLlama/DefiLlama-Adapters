const { addRaw, addToApi } = require('../rujira/balances')
const { getBlock, getContracts, queryContract } = require('../rujira/query')

async function staking(api) {
  const height = await getBlock(api)
  const contracts = await getContracts(height, 'rujira-staking')
  const balances = {}

  for (const { address } of contracts) {
    const config = await queryContract(address, { config: {} }, height)
    if (config.bond_denom !== 'x/ruji') continue
    const status = await queryContract(address, { status: {} }, height)
    addRaw(balances, 'x/ruji', status.account_bond)
    addRaw(balances, 'x/ruji', status.liquid_bond_size)
  }

  addToApi(api, balances)
}

async function tvl() {
  return {}
}

module.exports = {
  methodology:
    'Reports only legacy RUJI staking principal (account_bond plus liquid_bond_size) in the RUJI staking contract. Reward balances, liquid-bond shares, and RUJI held by other Rujira products are excluded.',
  thorchain: { tvl, staking },
}
