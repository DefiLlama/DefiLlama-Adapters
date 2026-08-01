const { treasuryExports } = require("../helper/treasury")
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = { bitcoin: { owners: bitcoinAddressBook.fbiDprk } }
module.exports = treasuryExports(config)