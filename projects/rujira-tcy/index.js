const { addToApi } = require('../helper/rujira/balances')
const { getBlock } = require('../helper/rujira/query')
const { getStakingBalances } = require('../helper/rujira/staking')

async function tvl(api) {
  const height = await getBlock(api)
  addToApi(api, await getStakingBalances(height, 'tcy'))
}

module.exports = {
  methodology:
    'Counts TCY user principal represented by account_bond plus liquid_bond_size in the production TCY contract. Revenue, rewards, liquid-bond shares, and unrelated AutoRujira balances are excluded.',
  thorchain: { tvl },
}
