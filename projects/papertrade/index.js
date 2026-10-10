const { addHypercoreSpotBalances } = require('../helper/chain/hyperliquid')

// Papertrade: synthetic BTC/ETH perps on HyperEVM against a protocol-owned LP. Trader deposits and the LP sit as USDC
// in the Exchange contract's HyperCore spot account, not on the EVM (its EVM token balances are zero).
const EXCHANGE = '0x6cd5661646289fb6e65ea5c032310fded797d0a2'

module.exports = {
  timetravel: false,
  methodology: 'USDC held in the Papertrade Exchange contract\'s HyperCore spot account: trader trading balances plus the protocol-owned LP that takes the other side of every position.',
  hyperliquid: {
    tvl: (api) => addHypercoreSpotBalances({ api, owners: [EXCHANGE] }),
  },
}
