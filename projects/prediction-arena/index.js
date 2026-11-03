const ADDRESSES = require('../helper/coreAssets.json')

// One immutable arena contract on Base. Every market is a poolId inside it
// (createPool / bet / settle), so there is no factory and nothing to enumerate.
const ARENA = '0x961872d75ea6E7A2859B9b04C6C7B1C73CF510b5'

module.exports = {
  timetravel: true,
  misrepresentedTokens: false,
  methodology:
    'USDC escrowed by the Prediction Arena contract. Stakes sit in the contract until their pool settles (pari-mutuel payout) or is cancelled (full refund); unclaimed payouts and unclaimed platform fees remain in the same balance.',
  base: {
    tvl: async (api) => {
      const balance = await api.call({
        abi: 'erc20:balanceOf',
        target: ADDRESSES.base.USDC,
        params: [ARENA],
      })
      api.add(ADDRESSES.base.USDC, balance)
    },
  },
}
