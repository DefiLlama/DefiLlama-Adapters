const {
  addScaled,
  addToApi,
} = require('../rujira/balances')
const { getBruneBacking } = require('../rujira/helper')
const { getBlock, getContracts } = require('../rujira/query')

async function tvl(api) {
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

module.exports = {
  methodology:
    'Counts all RUNE backing bRUNE: liquid RUNE in the bRUNE contract plus RUNE attributed to that contract as a bond provider across THORChain nodes. The x/brune receipt token is excluded, and the backing is normal TVL rather than Rujira staking.',
  thorchain: { tvl },
}
