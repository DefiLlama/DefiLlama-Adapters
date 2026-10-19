const { addToApi, addScaled, } = require('../helper/rujira/balances')
const { getStakingBalances } = require('../helper/rujira/staking')
const { getBruneBacking } = require('../helper/rujira/helper')
const { getBlock, getContracts } = require('../helper/rujira/query')

async function addBruneTvl(api) {
  const height = await getBlock(api)
  const contracts = await getContracts(height, 'rujira-brune')
  const balances = {}

  for (const { address } of contracts) {
    const { liquid, bonded } = await getBruneBacking(address, height)
    addScaled(balances, 'rune', liquid)
    addScaled(balances, 'rune', bonded)
  }

  addToApi(api, balances)
}

async function tvl(api) {
  const height = await getBlock(api)
  addToApi(api, await getStakingBalances(height, 'tcy'))

  await addBruneTvl(api)
}

async function staking(api) {
  const height = await getBlock(api)
  addToApi(api, await getStakingBalances(height, 'x/ruji'))
}

module.exports = {
  methodology:
    'Staking: RUJI staking principal (account_bond plus liquid_bond_size) in the RUJI staking contract. ' +
    'TVL: TCY staking principal (account_bond plus liquid_bond_size) in the production TCY contract, ' +
    'plus all RUNE backing bRUNE: liquid RUNE held by the bRUNE contract and RUNE attributed to it as a bond provider across THORChain nodes. ' +
    'Reward balances, revenue, liquid-bond shares, the x/brune receipt token, minted/virtual bRUNE, ' +
    'unrelated AutoRujira balances, and tokens held by other Rujira products are excluded.',
  thorchain: { tvl, staking },
}
