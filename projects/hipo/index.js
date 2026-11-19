const { call } = require('../helper/chain/ton')

module.exports = {
  timetravel: false,
  methodology:
    'GRAM controlled by the Hipo treasury: coins backing hGRAM (including coins lent to validators) plus deposits pending for the next validation round, less any shortfall left behind by a defaulting borrower',
  hallmarks: [
    ['2023-10-30', 'Hipo Launch'],
    ['2024-03-19', 'Hipo v2'],
  ],
  ton: {
    tvl: async () => {
      // get_treasury_state is append-only, so these positions are fixed
      const result = await call({ target: 'EQCLyZHP4Xe8fpchQz76O-_RmUhaVc_9BAoGyJrwJrcbz2eZ', abi: 'get_treasury_state' })
      const totalCoins = result[0] / 1e9
      const pendingDeposits = result[2] / 1e9
      // Pool money a defaulting borrower's collateral could not cover. The treasury deliberately
      // leaves it inside total_coins so the exchange rate never moves down for a loss, which makes
      // total_coins a claim rather than a balance -- these coins are gone. Normally zero.
      const deficit = result[5] / 1e9
      return {
        'coingecko:the-open-network': totalCoins + pendingDeposits - deficit,
      }
    },
  },
}
