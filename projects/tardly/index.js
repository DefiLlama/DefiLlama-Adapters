const { getAppGlobalState } = require('../helper/chain/algorand')
const TardlyAppID = 2724605419

async function getStake() {
  const state = await getAppGlobalState(TardlyAppID)
  return {
    'algorand': state['staked'] / 1e6,
  }
}

module.exports = {
  timetravel: false,
  methodology: 'Returns total amount staked in the Tardly No Loss Lottery.',
  algorand: {
    tvl: async () => {
      return getStake()
    },
  }
}
