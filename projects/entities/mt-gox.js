const { treasuryExports } = require("../helper/treasury")
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = { bitcoin: { owners: bitcoinAddressBook.mtGoxEntities } }
module.exports = treasuryExports(config)