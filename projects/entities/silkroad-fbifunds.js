const { treasuryExports } = require("../helper/treasury")
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = { bitcoin: { owners: bitcoinAddressBook.silkroadFBI } }
module.exports = treasuryExports(config)