const { sumTokensExport } = require('../helper/sumTokens')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

// https://www.kraken.com/kbtc
module.exports = {
  bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.krakenBTC }) }
}