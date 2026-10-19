const { addRaw } = require('./balances')
const { getContracts, queryContract } = require('./query')

async function getStakingBalances(height, denom) {
  const contracts = await getContracts(height, 'rujira-staking')
  const balances = {}

  for (const { address } of contracts) {
    const config = await queryContract(address, { config: {} }, height)
    if (config.bond_denom !== denom) continue
    const status = await queryContract(address, { status: {} }, height)
    addRaw(balances, denom, status.account_bond)
    addRaw(balances, denom, status.liquid_bond_size)
  }

  return balances
}

module.exports = { getStakingBalances }
