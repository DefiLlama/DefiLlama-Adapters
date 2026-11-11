const ADDRESSES = require('../helper/coreAssets.json')
const { sumTokens2 } = require('../helper/unwrapLPs')

// shadowpaper: synthetic BTC/ETH perpetuals on BNB Chain and Arc. Traders trade against a protocol-owned LP.
// Trader balances and the protocol-owned LP both sit as the settlement token inside the Exchange contract.
const config = {
  bsc: { exchange: '0x1C6Ca75b7A9E9F9Bdd25f602292E6cf2658A638c', token: ADDRESSES.bsc.USDT },
  arc: { exchange: '0x298f17dfeA7cD582637f3ce3C6Fad075e01Bc1a0', token: ADDRESSES.arc.USDC },
}

module.exports = {
  methodology: 'Settlement stablecoin held in the shadowpaper Exchange contract (USDT on BNB Chain, USDC on Arc): trader trading balances plus the protocol-owned LP that takes the other side of every position.',
}

Object.keys(config).forEach((chain) => {
  const { exchange, token } = config[chain]
  module.exports[chain] = { tvl: (api) => sumTokens2({ api, owner: exchange, tokens: [token] }) }
})
