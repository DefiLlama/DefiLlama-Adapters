const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
       '0xfa9f7a1cBfBCB688729c522b4F0905CcF4d26D25'
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.lbank
  },
}

module.exports = cexExports(config)