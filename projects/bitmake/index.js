const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = { bitcoin: { owners: bitcoinAddressBook.bitmake } }
module.exports = cexExports(config)
module.exports.methodology = 'We are only tracking one BTC wallet. We dont have information regarding other wallets'