const { treasuryExports } = require("../helper/treasury")
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = { bitcoin: { owners: bitcoinAddressBook.silkroadFBIEntities } }
module.exports = treasuryExports(config)