const { addRaw, addToApi } = require('../rujira/balances')
const { getBlock, getContracts, queryContract } = require('../rujira/query')

async function tvl(api) {
  const height = await getBlock(api)
  const contracts = await getContracts(height, 'rujira-staking')
  const balances = {}

  for (const { address } of contracts) {
    const config = await queryContract(address, { config: {} }, height)
    if (config.bond_denom !== 'tcy') continue
    const status = await queryContract(address, { status: {} }, height)
    addRaw(balances, 'tcy', status.account_bond)
    addRaw(balances, 'tcy', status.liquid_bond_size)
  }

  addToApi(api, balances)
}

module.exports = {
  methodology:
    'Counts TCY user principal represented by account_bond plus liquid_bond_size in the production TCY contract. Revenue, rewards, liquid-bond shares, and unrelated AutoRujira balances are excluded.',
  thorchain: { tvl },
}
