const { cexExports } = require('../helper/cex')
const bitcoinAddressBook = require('../helper/bitcoin-book/index.js')

const config = {
  ethereum: {
    owners: [
        '0xCAF80cfacBEF94d37De091093822f2a862adc47F'
    ],
  },
  bitcoin: {
    owners: bitcoinAddressBook.toobit
  },
  bsc: {
    owners: [
        '0xCAF80cfacBEF94d37De091093822f2a862adc47F'
    ]
  },
}

module.exports = cexExports(config)