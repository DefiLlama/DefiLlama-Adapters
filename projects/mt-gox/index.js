const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = { bitcoin: { owners: bitcoinAddressBook.mtGox } }
module.exports = cexExports(config)