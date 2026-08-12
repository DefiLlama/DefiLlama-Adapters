const { call } = require('../helper/chain/ton')

module.exports = {
  timetravel: false,
  methodology:
    'GRAM controlled by the Hipo treasury: coins backing hGRAM (including coins lent to validators) plus deposits pending for the next validation round',
  hallmarks: [
    ['2023-10-30', 'Hipo Launch'],
    ['2024-03-19', 'Hipo v2'],
  ],
  ton: {
    tvl: async () => {
      const result = await call({ target: 'EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ', abi: 'get_treasury_state' })
      const totalCoins = result[0] / 1e9
      const pendingDeposits = result[2] / 1e9
      return {
        'coingecko:the-open-network': totalCoins + pendingDeposits,
      }
    },
  },
}
