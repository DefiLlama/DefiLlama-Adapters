const { sumTokensExport } = require('../helper/sumTokens')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

module.exports = {
  bitcoin: { tvl: sumTokensExport({ owners: bitcoinAddressBook.elSalvador }) }
}