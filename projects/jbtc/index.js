const { sumTokensExport } = require('../helper/sumTokens')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  methodology: 'Total amount of BTC locked in Bitcoin network on wallet bc1qmukuv7j57umsd5tgg9fw88eqap57rzphkfckyp',
  bitcoin: {
    tvl: sumTokensExport({ owner: bitcoinAddressBook.jbtc }),
  }
}
