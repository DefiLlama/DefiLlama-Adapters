const { call } = require('../helper/chain/ton')

module.exports = {
  timetravel: false,
  methodology: 'Actual amount of TON staked on Hipo',
  hallmarks: [
    [1698685200, 'Hipo Launch'],
    [1710821940, 'Hipo v2'],
  ],
  ton: {
    tvl: async () => {
      const result = await call({ target: 'EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ', abi: 'get_treasury_state' })
      return {
        'coingecko:the-open-network': result[0] / 1e9,
      }
    },
  },
}
