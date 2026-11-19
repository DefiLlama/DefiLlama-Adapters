const { addHypercoreSpotBalances, addHypercoreLendingBalances } = require('../helper/chain/hyperliquid')

// Papertrade: synthetic BTC/ETH perps on HyperEVM against a protocol-owned LP. Trader deposits and the LP sit as USDC
// in the Exchange contract's HyperCore account, not on the EVM (its EVM token balances are zero). Part of that USDC is
// supplied to HyperCore lending, where it no longer shows in the spot balance.
const EXCHANGE = '0x6cd5661646289fb6e65ea5c032310fded797d0a2'

module.exports = {
  timetravel: false,
  doublecounted: true, // USDC supplied to HyperCore lending is also in hyperliquid-earn's TVL
  methodology: 'USDC held in the Papertrade Exchange contract\'s HyperCore account (spot balance plus USDC supplied to HyperCore lending): trader trading balances plus the protocol-owned LP that takes the other side of every position.',
  hyperliquid: {
    tvl: async (api) => {
      await addHypercoreSpotBalances({ api, owners: [EXCHANGE] })
      await addHypercoreLendingBalances({ api, owners: [EXCHANGE] })
    },
  },
}
