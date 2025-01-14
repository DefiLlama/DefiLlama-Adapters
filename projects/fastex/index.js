const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0xc21a1d213f64fedea3415737cce2be37eb59be81',
        '0x85e1de87a7575c6581f7930f857a3813b66a14d8',
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.fastex
  },
  tron: {
    owners: [
        'TPj7TCJ9rxdd243yQ3tc7iJzqcEYtupB4v'
    ]
  },
}

module.exports = cexExports(config)