const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = { bitcoin: { owners: bitcoinAddressBook.silkroad } }
module.exports = cexExports(config)