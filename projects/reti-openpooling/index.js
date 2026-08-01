const { getAppGlobalState } = require('../helper/chain/algorand')
const retiAppID = 2714516089

async function getStake () {
  const state = await getAppGlobalState(retiAppID)
  return {
    'algorand': state['staked'] / 1e6,
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Returns total amount staked protocol-wide for the Réti open pooling protocol.',
  algorand: {
    tvl: async () => {
      return getStake()
    },
  }
}
