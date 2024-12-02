const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  bitcoin: {
    owners: bitcoinAddressBook.phemex
  },
  ethereum: {
    owners: [
      '0xf7D13C7dBec85ff86Ee815f6dCbb3DEDAc78ca49'
    ],
  },
}

module.exports = cexExports(config)
module.exports.methodology = 'We are only tracking part of their cold wallets, more information here https://phemex.com/proof-of-reserves'